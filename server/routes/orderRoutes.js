const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.delete('/:id', authenticate, orderController.deleteOrder);

module.exports = router;
