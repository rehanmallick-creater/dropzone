const express = require('express');//Import + Setup ,
const router = express.Router();//Creates router for order-related APIs
const { getAllOrders, createOrder, updateOrderStatus, getUserOrders } = require('../controllers/orderController');//Import Controllers , Links routes → order logic
const { protect, adminOnly } = require('../middleware/authMiddleware');//Import Middleware , protect → user must be logged in ,adminOnly → only admin allowed 
//ROUTES
router.get('/', protect, adminOnly, getAllOrders);//Get all orders (ADMIN) ,Endpoint: GET /api/orders , Only admin can see all orders
router.post('/', protect, createOrder);//Create order (USER) ,Endpoint: POST /api/orders ,  Any logged-in user can create order
router.put('/:id', protect, adminOnly, updateOrderStatus);//Update order (ADMIN),Endpoint: PUT /api/orders/:id , Admin controls: status , drone assignment 
router.get('/myorders', protect, getUserOrders);// Get my orders(user) , Endpoint: GET /api/orders/myorders , Returns only logged-in user’s orders

module.exports = router;