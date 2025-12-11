const axios = require('axios');
const Logger = require('../utils/logger');

class OpenWeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.lat = process.env.OPENWEATHER_LAT || '55.75';
    this.lon = process.env.OPENWEATHER_LON || '10.27';
  }

  /**
   * Get current weather data for Endelave
   */
  async getCurrentWeather() {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: this.lat,
          lon: this.lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'da'
        }
      });

      const data = response.data;
      
      return {
        temperature: Math.round(data.main.temp),
        precipitation: data.rain ? data.rain['1h'] || 0 : 0,
        wind_speed: Math.round(data.wind.speed),
        weather_description: data.weather[0].description,
        humidity: data.main.humidity,
        pressure: data.main.pressure
      };
    } catch (error) {
      Logger.error('Error fetching weather data from OpenWeather', error);
      
      // Return mock data if API fails
      return {
        temperature: 15,
        precipitation: 0,
        wind_speed: 5,
        weather_description: 'delvis skyet',
        humidity: 70,
        pressure: 1013
      };
    }
  }

  /**
   * Get weather forecast for a specific date
   */
  async getForecast(date = new Date()) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: this.lat,
          lon: this.lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'da'
        }
      });

      // Find forecast closest to the target date
      const targetTime = date.getTime();
      let closestForecast = response.data.list[0];
      let minDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - targetTime);

      for (const forecast of response.data.list) {
        const forecastTime = new Date(forecast.dt * 1000).getTime();
        const diff = Math.abs(forecastTime - targetTime);
        
        if (diff < minDiff) {
          minDiff = diff;
          closestForecast = forecast;
        }
      }

      return {
        temperature: Math.round(closestForecast.main.temp),
        precipitation: closestForecast.rain ? closestForecast.rain['3h'] || 0 : 0,
        wind_speed: Math.round(closestForecast.wind.speed),
        weather_description: closestForecast.weather[0].description,
        humidity: closestForecast.main.humidity,
        pressure: closestForecast.main.pressure
      };
    } catch (error) {
      Logger.error('Error fetching weather forecast from OpenWeather', error);
      return this.getCurrentWeather();
    }
  }
}

module.exports = new OpenWeatherService();
