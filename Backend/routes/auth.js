const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const authUser = require('../middleware/authUser');
const { deleteAllUserData } = require('../controller/deleteUser');

// POST /api/auth/register
router.post('/register', [
    body('firstName', 'Enter a valid name').isLength({ min: 1 }),
    body('lastName', 'Enter a valid name').isLength({ min: 1 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    body('phoneNumber', 'Enter a valid phone number').isLength({ min: 10, max: 10 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    const { firstName, lastName, email, phoneNumber, password, isAdmin } = req.body;
    try {
        let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (user) {
            return res.status(400).json({ error: 'Sorry a user already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        user = await User.create({ firstName, lastName, email, phoneNumber, password: secPass, isAdmin });

        const authToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
        res.json({ success: true, authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' });
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

// GET /api/auth/getuser
router.get('/getuser', authUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'Something went wrong' });
    }
});

// PUT /api/auth/updateuser
router.put('/updateuser', authUser, async (req, res) => {
    const { userDetails } = req.body;
    const convertData = JSON.parse(userDetails);
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ error: 'User Not Found' });
        }
        await User.findByIdAndUpdate(req.user.id, { $set: convertData });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// DELETE /api/auth/delete/user/:userId
router.delete('/delete/user/:userId', authUser, deleteAllUserData);

module.exports = router;