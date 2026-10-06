const express = require('express');
const cors = require('cors');
const path = require('path');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static frontend serving
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'SIA-SA FST UIN Syarif Hidayatullah Jakarta',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// System Reset API (for demo & tests)
app.post('/api/system/reset', (req, res) => {
  const db = require('./database/db');
  db.reset();
  res.json({ success: true, message: 'Database reset to initial seed state.' });
});

// API Routes mounting (will be imported modularly)
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/krs', require('./routes/krsRoutes'));
app.use('/api/dpa', require('./routes/dpaRoutes'));
app.use('/api/prodi', require('./routes/prodiRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Fallback route for SPA client
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
