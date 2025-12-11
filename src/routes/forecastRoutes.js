const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const forecastController = require('../controllers/forecastController');

// Rate limiting configuration
// Limit forecast generation to prevent abuse and excessive API calls
const forecastLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many forecast requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for logging (more permissive)
const logLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many log requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /forecast/run
 * Trigger forecast generation
 */
router.post('/run', forecastLimiter, forecastController.runForecast.bind(forecastController));

/**
 * POST /forecast/log
 * Log actual guest numbers
 */
router.post('/log', logLimiter, forecastController.logActualGuests.bind(forecastController));

/**
 * GET /forecast/today
 * Get today's forecast
 */
router.get('/today', forecastController.getTodayForecast.bind(forecastController));

/**
 * GET /forecast/history
 * Get historical forecast data
 */
router.get('/history', forecastController.getHistory.bind(forecastController));

module.exports = router;
