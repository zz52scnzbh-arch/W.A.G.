const forecastService = require('../services/forecastService');
const ActualGuestLog = require('../models/ActualGuestLog');
const GuestForecastResult = require('../models/GuestForecastResult');
const Logger = require('../utils/logger');
const { getStartOfDay } = require('../utils/dateHelpers');

class ForecastController {
  /**
   * POST /forecast/run
   * Trigger forecast generation
   */
  async runForecast(req, res) {
    try {
      const { date } = req.body;
      const targetDate = date ? new Date(date) : new Date();
      
      Logger.info(`Forecast requested for ${targetDate.toISOString()}`);
      
      const result = await forecastService.runForecast(targetDate);
      
      res.status(200).json({
        success: true,
        message: 'Forecast generated successfully',
        data: result
      });
    } catch (error) {
      Logger.error('Error in runForecast controller', error);
      res.status(500).json({
        success: false,
        message: 'Error generating forecast',
        error: error.message
      });
    }
  }

  /**
   * POST /forecast/log
   * Log actual guest numbers
   */
  async logActualGuests(req, res) {
    try {
      const { date, actual_guests, notes } = req.body;
      
      if (!date || actual_guests === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Date and actual_guests are required'
        });
      }
      
      const targetDate = getStartOfDay(new Date(date));
      
      // Find corresponding forecast
      const forecast = await GuestForecastResult.findOne({ date: targetDate });
      
      // Check if log already exists
      const existingLog = await ActualGuestLog.findOne({ date: targetDate });
      
      if (existingLog) {
        // Update existing log
        existingLog.actual_guests = actual_guests;
        existingLog.notes = notes || '';
        existingLog.forecast_ref = forecast ? forecast._id : null;
        await existingLog.save();
        
        Logger.info(`Updated actual guest log for ${date}: ${actual_guests} guests`);
        
        return res.status(200).json({
          success: true,
          message: 'Actual guest log updated',
          data: existingLog
        });
      } else {
        // Create new log
        const log = new ActualGuestLog({
          date: targetDate,
          actual_guests,
          notes: notes || '',
          forecast_ref: forecast ? forecast._id : null
        });
        
        await log.save();
        
        Logger.info(`Logged actual guests for ${date}: ${actual_guests} guests`);
        
        return res.status(201).json({
          success: true,
          message: 'Actual guest log saved',
          data: log
        });
      }
    } catch (error) {
      Logger.error('Error in logActualGuests controller', error);
      res.status(500).json({
        success: false,
        message: 'Error logging actual guests',
        error: error.message
      });
    }
  }

  /**
   * GET /forecast/today
   * Get today's forecast
   */
  async getTodayForecast(req, res) {
    try {
      const forecast = await forecastService.getTodayForecast();
      
      if (!forecast) {
        return res.status(404).json({
          success: false,
          message: 'No forecast found for today'
        });
      }
      
      res.status(200).json({
        success: true,
        data: forecast
      });
    } catch (error) {
      Logger.error('Error in getTodayForecast controller', error);
      res.status(500).json({
        success: false,
        message: 'Error getting today forecast',
        error: error.message
      });
    }
  }

  /**
   * GET /forecast/history
   * Get historical forecast data
   */
  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 30;
      
      const history = await forecastService.getHistory(limit);
      
      // Calculate overall accuracy
      const accuracyData = history.filter(h => h.accuracy !== null);
      const averageAccuracy = accuracyData.length > 0
        ? Math.round(accuracyData.reduce((sum, h) => sum + h.accuracy, 0) / accuracyData.length)
        : null;
      
      res.status(200).json({
        success: true,
        data: {
          history,
          stats: {
            total_forecasts: history.length,
            forecasts_with_actuals: accuracyData.length,
            average_accuracy: averageAccuracy
          }
        }
      });
    } catch (error) {
      Logger.error('Error in getHistory controller', error);
      res.status(500).json({
        success: false,
        message: 'Error getting forecast history',
        error: error.message
      });
    }
  }
}

module.exports = new ForecastController();
