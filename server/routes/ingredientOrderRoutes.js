const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredientOrderController');
const authenticate = require('../middlewares/authMiddleware');

// CREATE
router.post('/', authenticate, controller.createIngredientOrder);

// READ
router.get('/', authenticate, controller.getAllIngredientOrders);
router.get('/:id', authenticate, controller.getIngredientOrderById);

// UPDATE
router.put('/:id', authenticate, controller.updateIngredientOrder);

// APPLY (창고 반영)
router.post('/:id/apply', authenticate, controller.applyIngredientOrder);

// DELETE
router.delete('/:id', authenticate, controller.deleteIngredientOrder);

module.exports = router;
