/**
 * GoalGear - Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (CSS, JS, images, HTML)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes (supports both /api/* and /* if Vercel serverless strips the /api prefix)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
    res.status(200).json({
        status: 'ok',
        app: 'GoalGear - Football Store',
        timestamp: new Date().toISOString()
    });
});

// JSON 404 handler for unmatched API routes
app.all('*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[GoalGear Server Error]', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

module.exports = app;
