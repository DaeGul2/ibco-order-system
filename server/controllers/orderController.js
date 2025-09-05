const {
  sequelize,                 // 트랜잭션
  Order, OrderItem, OrderIngredientSummary,
  ProductIngredient, Ingredient, Product,
  OrderProductIngredient,
  WarehousePriority, WarehouseIngredient // 🔥 추가
} = require('../models');

// [1] 발주 생성
exports.createOrder = async (req, res) => {
  const { title, writer, items } = req.body;

  try {
    // 1. Order 생성
    const order = await Order.create({
      title,
      writer,
      orderType: 'product', // ✅ 명시적으로 추가해야 함
    });

    // 2. OrderItem 생성
    const orderItems = await Promise.all(
      items.map(async (item) => {
        return await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantityKg: item.quantityKg,
          notePerIngredient: item.notePerIngredient || null,
        });
      })
    );
    for (const item of items) {
      const productIngredients = await ProductIngredient.findAll({
        where: { productId: item.productId },
        include: [{ model: Ingredient }],
      });

      const snapshotRows = productIngredients.map((pi) => {
        const amountPerKg = parseFloat(pi.amount);
        const unitCost = pi.Ingredient?.cost || 0;
        const totalAmountKg = (amountPerKg / 100) * item.quantityKg;
        const totalCost = Math.round(totalAmountKg * unitCost);

        return {
          orderId: order.id,
          productId: item.productId,
          ingredientId: pi.ingredientId,
          amountPerKg,
          unitCost,
          totalAmountKg,
          totalCost,
        };
      });

      await OrderProductIngredient.bulkCreate(snapshotRows);
    }
    // 3. 원료 총합 계산
    const ingredientTotals = {}; // ingredientId: totalKg

    for (const item of items) {
      const productIngredients = await ProductIngredient.findAll({
        where: { productId: item.productId },
      });

      productIngredients.forEach((pi) => {
        const amountPerKg = parseFloat(pi.amount); // %
        const total = (amountPerKg / 100) * item.quantityKg;

        if (!ingredientTotals[pi.ingredientId]) {
          ingredientTotals[pi.ingredientId] = 0;
        }

        ingredientTotals[pi.ingredientId] += total;
      });
    }

    // 4. OrderIngredientSummary 생성
    const summaryEntries = await Promise.all(
      Object.entries(ingredientTotals).map(async ([ingredientId, totalAmountKg]) => {
        const ingredient = await Ingredient.findByPk(ingredientId);
        const unitCost = ingredient.cost || 0;
        const totalCost = Math.round(totalAmountKg * unitCost);

        return {
          orderId: order.id,
          ingredientId: parseInt(ingredientId),
          totalAmountKg,
          unitCost,
          totalCost,
        };
      })
    );

    await OrderIngredientSummary.bulkCreate(summaryEntries);

    res.status(201).json({ message: '발주가 생성되었습니다.', orderId: order.id });
  } catch (err) {
    res.status(500).json({ message: '발주 생성 실패', error: err.message });
  }
};

// [2] 전체 발주 목록
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { orderType: 'product' }, // ✅ 필터링 추가
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: '발주 목록 조회 실패', error: err.message });
  }
};

// [3] 발주 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: '해당 발주를 찾을 수 없습니다.' });

    const items = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Product, attributes: ['name'] }]
    });

    const summary = await OrderIngredientSummary.findAll({
      where: { orderId: order.id },
      include: [{ model: Ingredient, attributes: ['name'] }]
    });

    const orderProductIngredients = await OrderProductIngredient.findAll({
      where: { orderId: order.id },
      include: [{ model: Ingredient, attributes: ['name'] }]
    });

    res.status(200).json({
      order,
      items,
      ingredientSummary: summary,
      orderProductIngredients, // ✅ 추가됨
    });
  } catch (err) {
    res.status(500).json({ message: '발주 상세 조회 실패', error: err.message });
  }
};

// [4] 발주 삭제
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: '해당 발주를 찾을 수 없습니다.' });

    // 🔥 자식 테이블 삭제 순서 중요!
    await OrderProductIngredient.destroy({ where: { orderId: order.id } }); // ✅ 누락된 부분
    await OrderItem.destroy({ where: { orderId: order.id } });
    await OrderIngredientSummary.destroy({ where: { orderId: order.id } });

    await order.destroy();

    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '발주 삭제 실패', error: err.message });
  }
};

// server/controllers/orderController.js

exports.applyProductOrder = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    // 1) 주문 조회 (OrderItem include 제거)
    const order = await Order.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.orderType !== 'product') {
      await t.rollback();
      return res.status(400).json({ message: 'Not a product-type order' });
    }
    if (order.isApplied) {
      await t.rollback();
      return res.status(409).json({ message: 'Already applied' });
    }

    // 2) 우선순위 1 창고 찾기
    const topPriority = await WarehousePriority.findOne({
      order: [['priorityOrder', 'ASC']],
      transaction: t,
    });
    if (!topPriority) {
      await t.rollback();
      return res.status(400).json({ message: 'No warehouse priority found' });
    }
    const warehouseId = topPriority.warehouseId;

    // 3) 이 주문의 제품→원료 스냅샷 집계
    const snapshotRows = await OrderProductIngredient.findAll({
      where: { orderId: order.id },
      transaction: t,
    });

    const needByIngredient = {};
    for (const row of snapshotRows) {
      const ingId = row.ingredientId;
      const kg = parseFloat(row.totalAmountKg || 0);
      if (!needByIngredient[ingId]) needByIngredient[ingId] = 0;
      needByIngredient[ingId] += kg;
    }

    if (!Object.keys(needByIngredient).length) {
      await t.rollback();
      return res.status(400).json({ message: 'No ingredient snapshot for this order' });
    }

    // 4) 재고 확인
    const shortages = [];
    const stockMap = {};

    for (const [ingredientIdStr, requiredKg] of Object.entries(needByIngredient)) {
      const ingredientId = parseInt(ingredientIdStr, 10);
      const wi = await WarehouseIngredient.findOne({
        where: { warehouseId, ingredientId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const current = parseFloat(wi?.stockKg || 0);
      if (current < requiredKg) {
        shortages.push({
          ingredientId,
          requiredKg,
          currentKg: current,
          lackingKg: +(requiredKg - current).toFixed(4),
        });
      } else {
        stockMap[ingredientId] = { record: wi, next: +(current - requiredKg).toFixed(4) };
      }
    }

    if (shortages.length) {
      await t.rollback();
      return res.status(400).json({
        message: 'Insufficient stock on priority-1 warehouse',
        warehouseId,
        shortages,
      });
    }

    // 5) 차감 적용
    for (const { record, next } of Object.values(stockMap)) {
      await record.update({ stockKg: next }, { transaction: t });
    }

    // 6) 주문 상태 갱신
    order.isApplied = true;
    await order.save({ transaction: t });

    await t.commit();
    return res.json({ ok: true, warehouseId, applied: true });
  } catch (err) {
    console.error(err);
    await t.rollback();
    return res.status(500).json({ message: 'Apply failed', error: err.message });
  }
};
