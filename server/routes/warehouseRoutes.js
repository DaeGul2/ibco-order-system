const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const warehouseIngredientController = require('../controllers/warehouseIngredientController');

// 창고 CRUD
router.post('/', warehouseController.createWarehouse);
router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', warehouseController.getWarehouseById);
router.put('/:id', warehouseController.updateWarehouse);
router.delete('/:id', warehouseController.deleteWarehouse);

// 창고별 원료 보유 CRUD
router.get('/:warehouseId/ingredients', warehouseIngredientController.getIngredientsByWarehouse);
router.get('/:warehouseId/ingredients/:ingredientId', warehouseIngredientController.getOne);
router.post('/ingredients', warehouseIngredientController.addOrUpdateIngredient);
router.delete('/:warehouseId/ingredients/:ingredientId', warehouseIngredientController.deleteWarehouseIngredient);

module.exports = router;
