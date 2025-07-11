const { Order, OrderItem, OrderIngredientSummary, ProductIngredient, Ingredient, Product, OrderProductIngredient } = require('../models');

// [1] 발주 생성
exports.createOrder = async (req, res) => {
  const { title, writer, items } = req.body;

  try {
    // 1. Order 생성
    const order = await Order.create({ title, writer });

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
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
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

