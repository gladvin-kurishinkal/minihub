require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { runSeed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/minihub';

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json({ limit: '10mb' })); // increased for base64 file uploads

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/backlogs', require('./routes/backlogs'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/results', require('./routes/results'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Connect to MongoDB, seed if needed, then start server
mongoose
    .connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected to:', MONGO_URI);
        await runSeed();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
