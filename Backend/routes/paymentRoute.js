const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const authUser = require('../middleware/authUser');
const { checkout, paymentVerification } = require('../controller/paymentController');

router.route('/checkout').post(checkout);
router.route('/paymentverification').post(paymentVerification);

// Returns the Razorpay public key (empty string if not configured)
router.get('/getkey', (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_API_KEY || '' });
});

// Get previous orders for logged-in user
router.get('/getPreviousOrders', authUser, async (req, res) => {
    try {
        const data = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;