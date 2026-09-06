require('dotenv').config();
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('CRITICAL: MONGO_URI is not set in environment variables.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(uri, {
            maxPoolSize: 20,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
            autoIndex: true
        });

        isConnected = !!conn.connections[0].readyState;
        console.log(`✅ MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        throw error;
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
    isConnected = false;
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

const gracefulShutdown = async () => {
    if (isConnected) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination.');
    }
};

process.on('SIGINT', async () => {
    await gracefulShutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await gracefulShutdown();
    process.exit(0);
});

module.exports = { connectDB, mongoose };
