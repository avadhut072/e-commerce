const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectToMongo = async () => {
    try {
        const url = process.env.MONGO_URL || 'mongodb://localhost:27017/e-commerce';
        const db = await mongoose.connect(url);
        console.log(`✅ MongoDB connected: ${db.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1); // Exit so the user notices the problem immediately
    }
};

module.exports = connectToMongo;