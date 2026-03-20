const jwt = require('jsonwebtoken');

const fetchUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Access denied: no token provided' });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Access denied: invalid token' });
    }
};

module.exports = fetchUser;