// REST API Routes Definition
const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const { upload } = require('../config/upload');

// Catalog & Product Endpoints
router.get('/products', productController.getProducts);
router.get('/products/:slug', productController.getProductBySlug);
router.get('/categories', productController.getCategories);
router.post('/promos/validate', productController.validatePromo);

// Checkout & Order Endpoints
router.post('/checkout', orderController.createOrder);
router.get('/orders/:orderNumber', orderController.getOrder);

// Customer Profile & Address Endpoints
router.get('/user/profile', userController.getProfile);
router.put('/user/profile', userController.updateProfile);
router.get('/user/orders', userController.getUserOrders);

// Admin Operations Endpoints
router.post('/admin/products', upload.array('images', 8), adminController.createProduct);
router.put('/admin/variants/:variantId/stock', adminController.updateStock);
router.get('/admin/orders', adminController.getOrders);
router.put('/admin/orders/:orderNumber/status', adminController.updateOrderStatus);

module.exports = router;
