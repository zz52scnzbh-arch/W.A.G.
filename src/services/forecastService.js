const weatherService = require('./weatherService');
const calendarService = require('./calendarService');
const ferryService = require('./ferryService');
const aiService = require('./aiService');
const emailService = require('./emailService');
const GuestForecastInput = require('../models/GuestForecastInput');
const GuestForecastResult = require('../models/GuestForecastResult');
const Logger = require('../utils/logger');
const { getDanishWeekday, formatDate, isDanishHoliday } = require('../utils/dateHelpers');

class ForecastService {
  /**
   * Run complete forecast for a given date
   */
  async runForecast(date = new Date()) {
    try {
      Logger.info(`Starting forecast for ${formatDate(date)}`);
      
      // Step 1: Collect data from all sources
      const inputData = await this.collectInputData(date);
      Logger.info('Input data collected:', inputData);
      
      // Step 2: Save input data to database
      const savedInput = await this.saveInputData(inputData);
      Logger.info('Input data saved to database');
      
      // Step 3: Get AI prediction
      const prediction = await aiService.getPrediction(inputData);
      Logger.info('AI prediction received:', prediction);
      
      // Step 4: Save forecast result to database
      const forecastResult = await this.saveForecastResult(date, prediction, savedInput._id);
      Logger.info('Forecast result saved to database');
      
      // Step 5: Send email notification
      const emailData = {
        date: formatDate(date),
        ...prediction
      };
      await emailService.sendForecastEmail(emailData);
      Logger.info('Forecast email sent');
      
      return {
        success: true,
        date: formatDate(date),
        input: inputData,
        forecast: forecastResult
      };
    } catch (error) {
      Logger.error('Error running forecast', error);
      throw error;
    }
  }

  /**
   * Collect input data from all sources
   */
  async collectInputData(date) {
    try {
      // Initialize calendar service
      await calendarService.initialize();
      
      // Collect data in parallel for efficiency
      const [weatherData, calendarEvents, ferryData] = await Promise.all([
        weatherService.getForecast(date),
        calendarService.getEventsForDate(date),
        ferryService.getFerryData(date)
      ]);
      
      const weekday = getDanishWeekday(date);
      const isHoliday = isDanishHoliday(date);
      const eventString = calendarService.formatEventsString(calendarEvents);
      
      // Adjust ferry passengers if holiday
      if (isHoliday) {
        ferryData.ferry_expected_passengers = Math.min(
          Math.round(ferryData.ferry_expected_passengers * 1.3),
          ferryData.ferry_capacity
        );
      }
      
      return {
        date,
        weekday,
        temperature: weatherData.temperature,
        precipitation: weatherData.precipitation,
        wind_speed: weatherData.wind_speed,
        weather_description: weatherData.weather_description,
        ferry_capacity: ferryData.ferry_capacity,
        ferry_expected_passengers: ferryData.ferry_expected_passengers,
        event: eventString,
        is_holiday: isHoliday
      };
    } catch (error) {
      Logger.error('Error collecting input data', error);
      throw error;
    }
  }

  /**
   * Save input data to database
   */
  async saveInputData(inputData) {
    try {
      const input = new GuestForecastInput(inputData);
      return await input.save();
    } catch (error) {
      Logger.error('Error saving input data', error);
      throw error;
    }
  }

  /**
   * Save forecast result to database
   */
  async saveForecastResult(date, prediction, inputRef) {
    try {
      // Check if forecast already exists for this date
      const existing = await GuestForecastResult.findOne({ date });
      
      if (existing) {
        // Update existing forecast
        existing.predicted_guests = prediction.predicted_guests;
        existing.confidence = prediction.confidence;
        existing.explanation = prediction.explanation;
        existing.suggestions = prediction.suggestions;
        existing.input_ref = inputRef;
        return await existing.save();
      } else {
        // Create new forecast
        const result = new GuestForecastResult({
          date,
          predicted_guests: prediction.predicted_guests,
          confidence: prediction.confidence,
          explanation: prediction.explanation,
          suggestions: prediction.suggestions,
          input_ref: inputRef
        });
        return await result.save();
      }
    } catch (error) {
      Logger.error('Error saving forecast result', error);
      throw error;
    }
  }

  /**
   * Get today's forecast
   */
  async getTodayForecast() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const forecast = await GuestForecastResult.findOne({ date: today })
        .populate('input_ref')
        .sort({ createdAt: -1 });
      
      if (!forecast) {
        return null;
      }
      
      return forecast;
    } catch (error) {
      Logger.error('Error getting today forecast', error);
      throw error;
    }
  }

  /**
   * Get historical forecast data with comparison
   */
  async getHistory(limit = 30) {
    try {
      const forecasts = await GuestForecastResult.find()
        .populate('input_ref')
        .sort({ date: -1 })
        .limit(limit);
      
      // Get corresponding actual logs
      const ActualGuestLog = require('../models/ActualGuestLog');
      
      const history = await Promise.all(
        forecasts.map(async (forecast) => {
          const actualLog = await ActualGuestLog.findOne({ date: forecast.date });
          
          return {
            date: forecast.date,
            predicted_guests: forecast.predicted_guests,
            actual_guests: actualLog ? actualLog.actual_guests : null,
            accuracy: actualLog 
              ? Math.round((1 - Math.abs(forecast.predicted_guests - actualLog.actual_guests) / actualLog.actual_guests) * 100)
              : null,
            confidence: forecast.confidence,
            explanation: forecast.explanation
          };
        })
      );
      
      return history;
    } catch (error) {
      Logger.error('Error getting forecast history', error);
      throw error;
    }
  }
}

module.exports = new ForecastService();
