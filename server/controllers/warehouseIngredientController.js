const { WarehouseIngredient, Warehouse, Ingredient } = require('../models');

// 1. 특정 창고의 보유 원료 전체 조회
exports.getIngredientsByWarehouse = async (req, res) => {
  try {
    const list = await WarehouseIngredient.findAll({
      where: { warehouseId: req.params.warehouseId },
      include: [{ model: Ingredient, attributes: ['name', 'id'] }],
      order: [['ingredientId', 'ASC']]
    });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: '보유 원료 조회 실패', error: err.message });
  }
};

// 2. 특정 창고-원료 1개 조회
exports.getOne = async (req, res) => {
  try {
    const { warehouseId, ingredientId } = req.params;
    const entry = await WarehouseIngredient.findOne({
      where: { warehouseId, ingredientId },
      include: [{ model: Ingredient }]
    });
    if (!entry) return res.status(404).json({ message: '해당 데이터를 찾을 수 없습니다.' });
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ message: '단일 조회 실패', error: err.message });
  }
};

// 3. 보유 원료 추가
exports.addOrUpdateIngredient = async (req, res) => {
  try {
    const { warehouseId, ingredientId, stockKg } = req.body;

    const existing = await WarehouseIngredient.findOne({ where: { warehouseId, ingredientId } });

    if (existing) {
      await existing.update({ stockKg });
      return res.status(200).json({ message: '재고가 업데이트되었습니다.' });
    } else {
      const created = await WarehouseIngredient.create({ warehouseId, ingredientId, stockKg });
      return res.status(201).json({ message: '원료가 추가되었습니다.', data: created });
    }
  } catch (err) {
    res.status(500).json({ message: '추가/수정 실패', error: err.message });
  }
};

// 4. 보유 원료 삭제
exports.deleteWarehouseIngredient = async (req, res) => {
  try {
    const { warehouseId, ingredientId } = req.params;
    const entry = await WarehouseIngredient.findOne({ where: { warehouseId, ingredientId } });
    if (!entry) return res.status(404).json({ message: '해당 데이터를 찾을 수 없습니다.' });

    await entry.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: '삭제 실패', error: err.message });
  }
};

exports.bulkSetIngredients = async (req, res) => {
  try {
    const list = req.body; // [{ warehouseId, ingredientId, stockKg }]

    for (const item of list) {
      const { warehouseId, ingredientId, stockKg } = item;
      if (!warehouseId || !ingredientId || isNaN(stockKg)) continue;

      const existing = await WarehouseIngredient.findOne({
        where: { warehouseId, ingredientId }
      });

      if (existing) {
        await existing.update({ stockKg: parseFloat(stockKg) });
      } else {
        await WarehouseIngredient.create({
          warehouseId,
          ingredientId,
          stockKg: parseFloat(stockKg)
        });
      }
    }

    res.status(200).json({ message: '일괄 저장 완료' });
  } catch (err) {
    res.status(500).json({ message: '일괄 저장 실패', error: err.message });
  }
};
