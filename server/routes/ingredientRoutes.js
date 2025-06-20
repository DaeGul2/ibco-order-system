const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const authenticate = require('../middlewares/authMiddleware');

// 모든 원료 라우트는 로그인 필요
router.post('/', authenticate, ingredientController.createIngredient);
router.get('/', authenticate, ingredientController.getAllIngredients);
router.get('/:id', authenticate, ingredientController.getIngredientById);
router.put('/:id', authenticate, ingredientController.updateIngredient);
router.delete('/:id', authenticate, ingredientController.deleteIngredient);

module.exports = router;
