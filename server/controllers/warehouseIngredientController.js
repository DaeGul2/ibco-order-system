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
    console.log('🟡 수신된 리스트:', list);

    // list가 아예 비었으면 모든 창고 원료 삭제
    if (!Array.isArray(list)) {
      return res.status(400).json({ message: '잘못된 요청 형식입니다.' });
    }

    // 창고 ID 리스트 수집
    const allWarehouseIds = [...new Set(list.map(i => i.warehouseId))];

    // 예외: list가 비었으면 모든 창고에서 원료 삭제
    if (list.length === 0) {
      await WarehouseIngredient.destroy({ where: {} });
      return res.status(200).json({ message: '모든 창고의 원료가 삭제되었습니다.' });
    }

    // 1. 리스트를 창고별로 group
    const grouped = {};
    list.forEach(({ warehouseId, ingredientId, stockKg }) => {
      if (!grouped[warehouseId]) grouped[warehouseId] = {};
      grouped[warehouseId][ingredientId] = parseFloat(stockKg);
    });

    // 2. 창고별 처리
    for (const warehouseId in grouped) {
      const keepMap = grouped[warehouseId];

      // 현재 DB 상태 조회
      const existing = await WarehouseIngredient.findAll({ where: { warehouseId } });

      // 삭제 대상 제거
      for (const record of existing) {
        if (!keepMap[record.ingredientId]) {
          await record.destroy();
        }
      }

      // update / create
      for (const ingredientId in keepMap) {
        const stockKg = keepMap[ingredientId];
        const found = existing.find(e => e.ingredientId == ingredientId);
        if (found) {
          await found.update({ stockKg });
        } else {
          await WarehouseIngredient.create({ warehouseId, ingredientId, stockKg });
        }
      }
    }

    res.status(200).json({ message: '일괄 저장 및 삭제 완료' });
  } catch (err) {
    console.error('❌ 저장 실패:', err);
    res.status(500).json({ message: '저장 실패', error: err.message });
  }
};
