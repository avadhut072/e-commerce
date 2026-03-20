const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const checkAdmin = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Access denied: no token provided' });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        const user = await User.findById(req.user.id);
        if (user && user.isAdmin === true) {
            next();
        } else {
            res.status(403).json({ error: 'Access denied: admin only' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Access denied: invalid token' });
    }
};

module.exports = checkAdmin;