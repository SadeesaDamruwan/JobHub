const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const { connectDB, mongoose } = require('./config/db');

const app = express();

app.use(compression());
app.use(cors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

function safeRequire(path) {
    try {
        return require(path);
    } catch (err) {
        console.error(`\n🔥 FAILED TO LOAD ROUTE FILE: ${path}`);
        console.error(err);
        process.exit(1);
    }
}

const jobRoutes = safeRequire('./routes/jobRoutes');
const companyAuthRoutes = safeRequire('./routes/companyAuthRoutes');
const seekerRoutes = safeRequire('./routes/seekerRoutes');
const applicationRoutes = safeRequire('./routes/applicationRoutes');
const companyRoutes = safeRequire('./routes/companyRoutes');

app.use('/api/jobs', jobRoutes);
app.use('/api/company', companyAuthRoutes);
app.use('/api/seeker', seekerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/company-details', companyRoutes);

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        success: true,
        status: 'UP',
        database: dbStatus,
        uptime: process.uptime()
    });
});

app.get('/', (req, res) => {
    res.send('JobHub Backend is up and running with MongoDB!');
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
    } catch (err) {
        console.warn('⚠️ Warning: Initial MongoDB connection failed. Server will still attempt to listen and reconnect in background.');
    }

    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
        console.error('\n🔥 SERVER FAILED TO START:');
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Run: lsof -i :${PORT} then kill the process.`);
        } else {
            console.error(err);
        }
    });
};

startServer();