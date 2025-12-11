const Logger = require('../utils/logger');

class FerryService {
  constructor() {
    this.defaultCapacity = parseInt(process.env.FERRY_DEFAULT_CAPACITY) || 100;
    this.enabled = process.env.FERRY_API_ENABLED === 'true';
  }

  /**
   * Get ferry capacity and expected passengers
   * This is a mock implementation - replace with actual API if available
   */
  async getFerryData(date = new Date()) {
    try {
      if (!this.enabled) {
        Logger.debug('Ferry API not enabled, using estimates');
        return this.estimateFerryData(date);
      }

      // TODO: Replace with actual ferry API integration
      // For now, return estimated data
      return this.estimateFerryData(date);
    } catch (error) {
      Logger.error('Error fetching ferry data', error);
      return this.estimateFerryData(date);
    }
  }

  /**
   * Estimate ferry data based on day of week and season
   */
  estimateFerryData(date) {
    const dayOfWeek = date.getDay();
    const month = date.getMonth() + 1;
    
    let expectedPassengers = 30; // Base weekday traffic
    
    // Weekend increase
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      expectedPassengers = 60;
    }
    
    // Friday increase
    if (dayOfWeek === 5) {
      expectedPassengers = 50;
    }
    
    // Summer season boost (May-August)
    if (month >= 5 && month <= 8) {
      expectedPassengers = Math.round(expectedPassengers * 1.5);
    }
    
    // Holiday season boost (checked externally)
    // This will be adjusted by the main service
    
    return {
      ferry_capacity: this.defaultCapacity,
      ferry_expected_passengers: Math.min(expectedPassengers, this.defaultCapacity)
    };
  }
}

module.exports = new FerryService();
