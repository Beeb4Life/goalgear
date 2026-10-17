/**
 * GoalGear - Protected Admin Routes
 *
 * All endpoints require valid JWT authentication and role === 'admin'.
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply protection to all admin routes
router.use(authenticateToken, requireAdmin);

// Dashboard metrics
router.get('/stats', adminController.getDashboardStats);

// Product CRUD
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Inventory
router.patch('/products/:id/stock', adminController.updateStock);

// Order management
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
