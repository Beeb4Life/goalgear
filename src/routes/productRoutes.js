/**
 * GoalGear - Product Catalogue Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/filter-options', productController.getFilterOptions);
router.get('/:id', productController.getProductById);

module.exports = router;
