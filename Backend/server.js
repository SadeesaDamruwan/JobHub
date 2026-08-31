// ==========================================
// 🚨 THE TRAP: Catch whatever is closing the server
// ==========================================
const originalExit = process.exit;
process.exit = function(code) {
    console.log(`\n🚨 GOTCHA! process.exit(${code}) was called.`);
    console.trace('Here is the exact file and line that called it:');
    originalExit(code);
};

// ==========================================
// 🚨 SAFETY NETS: Catch uncaught errors & rejections
// ==========================================
process.on('uncaughtException', (err) => {
    console.error('\n🔥 UNCAUGHT EXCEPTION — this crashed the process:');
    console.error(err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n🔥 UNHANDLED PROMISE REJECTION:');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// 1. IMPORT ROUTE FILES (wrapped so a broken
//    route file gives a clear error instead of
//    a silent crash at require-time)
// ==========================================
function safeRequire(path) {
    try {
        return require(path);
    } catch (err) {
        console.error(`\n🔥 FAILED TO LOAD ROUTE FILE: ${path}`);
        console.error(err);
        process.exit(1); // will be caught by the trap above too
    }
}

const jobRoutes = safeRequire('./routes/jobRoutes');
const companyAuthRoutes = safeRequire('./routes/companyAuthRoutes');
const seekerRoutes = safeRequire('./routes/seekerRoutes');
const applicationRoutes = safeRequire('./routes/applicationRoutes');
const companyRoutes = safeRequire('./routes/companyRoutes');

// ==========================================
// 2. REGISTER API ROUTES
// ==========================================
app.use('/api/jobs', jobRoutes);
app.use('/api/company', companyAuthRoutes);
app.use('/api/seeker', seekerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/company-details', companyRoutes);

// ==========================================
// 3. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('JobHub Backend is up and running!');
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('\n🔥 SERVER FAILED TO START:');
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Run: lsof -i :${PORT}  then kill the process.`);
    } else {
        console.error(err);
    }
});