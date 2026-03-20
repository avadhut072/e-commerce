const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const authAdmin = require('../../middleware/authAdmin');
const { body, validationResult } = require('express-validator');
const {
    getAllUsersInfo, getSingleUserInfo, getUserCart, getUserWishlist,
    getUserReview, deleteUserReview, deleteUserCartItem, deleteUserWishlistItem,
    updateProductDetails, userPaymentDetails, getAllOrders, addProduct, deleteProduct
} = require('../../controller/AdminControl');
const { chartData } = require('../../controller/AllProductInfo');

const adminKey = process.env.ADMIN_KEY;

// Admin info routes (protected)
router.get('/getusers', authAdmin, getAllUsersInfo);
router.get('/geteuser/:userId', authAdmin, getSingleUserInfo);
router.get('/getcart/:userId', authAdmin, getUserCart);
router.get('/getwishlist/:userId', authAdmin, getUserWishlist);
router.get('/getreview/:userId', authAdmin, getUserReview);
router.get('/getorder/:id', authAdmin, userPaymentDetails);
router.get('/allorders', authAdmin, getAllOrders);
router.get('/chartdata', chartData);

// POST /api/admin/login
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    const { email, password, key } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.isAdmin !== true || key !== adminKey) {
            return res.status(400).json({ success: false, error: 'Invalid User or admin key' });
        }

        const passComp = await bcrypt.compare(password, user.password);
        if (!passComp) {
            return res.status(400).json({ success: false, error: 'Please try to login with correct credentials' });
        }

        const authToken = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET);
        res.json({ success: true, authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/register
router.post('/register', [
    body('firstName', 'Enter a valid name').isLength({ min: 3 }),
    body('lastName', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    body('phoneNumber', 'Enter a valid phone number').isLength({ min: 10, max: 10 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    const { firstName, lastName, email, phoneNumber, password, key } = req.body;
    try {
        const existing = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existing) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        if (key !== adminKey) {
            return res.status(400).json({ success: false, error: 'Invalid admin key' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        const user = await User.create({ firstName, lastName, email, phoneNumber, password: secPass, isAdmin: true });
        const authToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
        res.json({ success: true, authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Product management
router.post('/addproduct', authAdmin, addProduct);
router.put('/updateproduct/:id', authAdmin, updateProductDetails);
router.delete('/deleteproduct/:id', authAdmin, deleteProduct);

// User data management
router.delete('/review/:id', authAdmin, deleteUserReview);
router.delete('/usercart/:id', authAdmin, deleteUserCartItem);
router.delete('/userwishlist/:id', authAdmin, deleteUserWishlistItem);

module.exports = router;