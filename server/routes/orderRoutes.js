const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.delete('/:id', authenticate, orderController.deleteOrder);
router.post('/:id/apply', authenticate, orderController.applyProductOrder);

module.exports = router;
