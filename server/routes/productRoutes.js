const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middlewares/authMiddleware');

// 모든 제품 API는 인증 필요
router.post('/', authenticate, productController.createProduct);
router.get('/', authenticate, productController.getAllProducts);

router.get('/:productId/check-feasibility', authenticate, productController.checkFeasibilityForProduct);

router.get('/:id', authenticate, productController.getProductById);
router.put('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);
// routes/productRoutes.js



module.exports = router;
