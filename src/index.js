require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const forecastRoutes = require('./routes/forecastRoutes');
const cronScheduler = require('./scheduler');
const Logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (simple version)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Endelave Forecast Agent API',
    version: '1.0.0',
    endpoints: {
      forecast_run: 'POST /forecast/run',
      forecast_log: 'POST /forecast/log',
      forecast_today: 'GET /forecast/today',
      forecast_history: 'GET /forecast/history'
    }
  });
});

// API Routes
app.use('/forecast', forecastRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
      Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Start cron scheduler
      if (process.env.CRON_ENABLED !== 'false') {
        cronScheduler.start();
      } else {
        Logger.info('Cron scheduler disabled');
      }
    });
  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  Logger.info('SIGTERM signal received: closing HTTP server');
  cronScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  Logger.info('SIGINT signal received: closing HTTP server');
  cronScheduler.stop();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
