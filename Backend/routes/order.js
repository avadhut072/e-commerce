const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/authUser');
const { placeOrder } = require('../controller/orderController');

// POST /api/order/place — authenticated user places a direct order (no Razorpay)
router.post('/place', fetchUser, placeOrder);

module.exports = router;
