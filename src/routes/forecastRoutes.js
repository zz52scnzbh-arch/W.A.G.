const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

/**
 * POST /forecast/run
 * Trigger forecast generation
 */
router.post('/run', forecastController.runForecast.bind(forecastController));

/**
 * POST /forecast/log
 * Log actual guest numbers
 */
router.post('/log', forecastController.logActualGuests.bind(forecastController));

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
