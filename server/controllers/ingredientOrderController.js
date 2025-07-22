// server/controllers/ingredientOrderController.js
const {
  Order,
  OrderIngredientItem,
  WarehouseIngredient,
  Ingredient,
  Warehouse,
} = require('../models');

// [CREATE] 원료 발주 생성
exports.createIngredientOrder = async (req, res) => {
  const { title, writer, warehouseId, items } = req.body;

  try {
    const order = await Order.create({
      title,
      writer,
      orderType: 'ingredient',
      isApplied: false,
    });

    for (const item of items) {
      const ingredient = await Ingredient.findByPk(item.ingredientId);
      if (!ingredient) continue;

      const unitCost = ingredient.cost || 0;
      const quantityKg = parseFloat(item.quantityKg);
      const totalCost = Math.round(unitCost * quantityKg);

      await OrderIngredientItem.create({
        orderId: order.id,
        ingredientId: item.ingredientId,
        quantityKg,
        unitCost,
        totalCost,
        warehouseId,
      });
    }

    res.status(201).json({ message: '원료 발주가 저장되었습니다.', orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '원료 발주 실패', error: err.message });
  }
};

// [READ] 전체 원료 발주 목록
exports.getAllIngredientOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { orderType: 'ingredient' },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: '목록 조회 실패', error: err.message });
  }
};

// [READ] 단일 발주 상세
exports.getIngredientOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order || order.orderType !== 'ingredient') {
      return res.status(404).json({ message: '해당 발주를 찾을 수 없습니다.' });
    }

    const items = await OrderIngredientItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Ingredient }, { model: Warehouse }],
    });

    res.status(200).json({ order, items });
  } catch (err) {
    res.status(500).json({ message: '상세 조회 실패', error: err.message });
  }
};

// [UPDATE] 발주 수정 (isApplied: false일 경우만)
exports.updateIngredientOrder = async (req, res) => {
  const { title, warehouseId, items } = req.body;
  const orderId = req.params.id;

  try {
    const order = await Order.findByPk(orderId);
    if (!order || order.orderType !== 'ingredient') {
      return res.status(404).json({ message: '해당 발주를 찾을 수 없습니다.' });
    }

    if (order.isApplied) {
      return res.status(400).json({ message: '이미 창고에 반영된 발주는 수정할 수 없습니다.' });
    }

    await order.update({ title });

    await OrderIngredientItem.destroy({ where: { orderId } });

    for (const item of items) {
      const ingredient = await Ingredient.findByPk(item.ingredientId);
      if (!ingredient) continue;

      const unitCost = ingredient.cost || 0;
      const quantityKg = parseFloat(item.quantityKg);
      const totalCost = Math.round(unitCost * quantityKg);

      await OrderIngredientItem.create({
        orderId,
        ingredientId: item.ingredientId,
        quantityKg,
        unitCost,
        totalCost,
        warehouseId,
      });
    }

    res.status(200).json({ message: '발주가 수정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '수정 실패', error: err.message });
  }
};

// [DELETE] 발주 삭제 (isApplied: false일 경우만)
exports.deleteIngredientOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order || order.orderType !== 'ingredient') {
      return res.status(404).json({ message: '해당 발주를 찾을 수 없습니다.' });
    }

  

    await OrderIngredientItem.destroy({ where: { orderId: order.id } });
    await order.destroy();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: '삭제 실패', error: err.message });
  }
};

// [APPLY] 창고 수량 반영
exports.applyIngredientOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order || order.orderType !== 'ingredient') {
      return res.status(404).json({ message: '해당 발주를 찾을 수 없습니다.' });
    }

    if (order.isApplied) {
      return res.status(400).json({ message: '이미 창고에 반영된 발주입니다.' });
    }

    const items = await OrderIngredientItem.findAll({ where: { orderId: order.id } });

    for (const item of items) {
      const existing = await WarehouseIngredient.findOne({
        where: { warehouseId: item.warehouseId, ingredientId: item.ingredientId },
      });

      if (existing) {
        await existing.update({
          stockKg: parseFloat(existing.stockKg) + parseFloat(item.quantityKg),
        });
      } else {
        await WarehouseIngredient.create({
          warehouseId: item.warehouseId,
          ingredientId: item.ingredientId,
          stockKg: parseFloat(item.quantityKg),
        });
      }
    }

    await order.update({ isApplied: true });

    res.status(200).json({ message: '창고 반영이 완료되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '창고 반영 실패', error: err.message });
  }
};
