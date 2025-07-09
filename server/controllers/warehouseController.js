const { Warehouse } = require('../models');

// 1. 창고 생성
exports.createWarehouse = async (req, res) => {
  try {
    const { name, isFavorite } = req.body;
    const warehouse = await Warehouse.create({ name, isFavorite });
    res.status(201).json(warehouse);
  } catch (err) {
    res.status(500).json({ message: '창고 생성 실패', error: err.message });
  }
};

// 2. 창고 전체 조회
exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({ order: [['createdAt', 'ASC']] });
    res.status(200).json(warehouses);
  } catch (err) {
    res.status(500).json({ message: '창고 목록 조회 실패', error: err.message });
  }
};

// 3. ID 기준 단일 창고 조회
exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });
    res.status(200).json(warehouse);
  } catch (err) {
    res.status(500).json({ message: '창고 조회 실패', error: err.message });
  }
};

// 4. 창고 수정
exports.updateWarehouse = async (req, res) => {
  try {
    const { name, isFavorite } = req.body;
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });

    await warehouse.update({ name, isFavorite });
    res.status(200).json({ message: '창고가 수정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '창고 수정 실패', error: err.message });
  }
};

// 5. 창고 삭제
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });

    await warehouse.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: '창고 삭제 실패', error: err.message });
  }
};
