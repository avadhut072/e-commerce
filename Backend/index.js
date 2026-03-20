// Load environment variables FIRST before any other imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const connectToMongo = require('./config');

const auth = require('./routes/auth');
const cart = require('./routes/cart');
const wishlist = require('./routes/wishlist');
const product = require('./routes/product');
const review = require('./routes/review');
const paymentRoute = require('./routes/paymentRoute');
const forgotPassword = require('./routes/forgotPassword');
const AdminRoute = require('./routes/Admin/AdminAuth');
const orderRoute = require('./routes/order');
const authUser = require('./middleware/authUser');

// Connect to MongoDB
connectToMongo();

const port = process.env.PORT || 5000;

const app = express();

// Allow requests from the local React dev server
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', auth);
app.use('/api/product', product);
app.use('/api/cart', cart);
app.use('/api/wishlist', wishlist);
app.use('/api/review', review);
app.use('/api/admin', AdminRoute);
app.use('/api/order', orderRoute);
app.use('/api', paymentRoute);
app.use('/api/password', forgotPassword);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`\n🚀 E-commerce backend running at http://localhost:${port}`);
    console.log(`   MongoDB: ${process.env.MONGO_URL}`);
    console.log(`   Environment: local\n`);
});
