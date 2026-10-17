/**
 * GoalGear - Orders Routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);

module.exports = router;
