const cron = require('node-cron');
const forecastService = require('./services/forecastService');
const Logger = require('./utils/logger');

class CronScheduler {
  constructor() {
    this.schedule = process.env.CRON_SCHEDULE || '0 4 * * *'; // Default: 4 AM daily
    this.task = null;
  }

  /**
   * Start cron job
   */
  start() {
    try {
      Logger.info(`Starting cron job with schedule: ${this.schedule}`);
      
      this.task = cron.schedule(this.schedule, async () => {
        Logger.info('Cron job triggered - running daily forecast');
        
        try {
          await forecastService.runForecast();
          Logger.info('Daily forecast completed successfully');
        } catch (error) {
          Logger.error('Error in daily forecast cron job', error);
        }
      });

      Logger.info('Cron job scheduled successfully');
    } catch (error) {
      Logger.error('Error starting cron job', error);
    }
  }

  /**
   * Stop cron job
   */
  stop() {
    if (this.task) {
      this.task.stop();
      Logger.info('Cron job stopped');
    }
  }
}

module.exports = new CronScheduler();
