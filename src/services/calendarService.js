const { google } = require('googleapis');
const Logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class GoogleCalendarService {
  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID;
    this.credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json';
    this.calendar = null;
  }

  /**
   * Initialize Google Calendar API
   */
  async initialize() {
    try {
      // Check if credentials file exists
      if (!fs.existsSync(this.credentialsPath)) {
        Logger.warn('Google Calendar credentials not found. Service will return mock data.');
        return false;
      }

      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly']
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      return true;
    } catch (error) {
      Logger.error('Error initializing Google Calendar service', error);
      return false;
    }
  }

  /**
   * Get events for a specific date
   */
  async getEventsForDate(date = new Date()) {
    try {
      // If calendar not initialized or no calendar ID, return mock
      if (!this.calendar || !this.calendarId) {
        Logger.warn('Google Calendar not configured. Returning no events.');
        return [];
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items || [];
      return events.map(event => ({
        summary: event.summary,
        description: event.description || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date
      }));
    } catch (error) {
      Logger.error('Error fetching Google Calendar events', error);
      return [];
    }
  }

  /**
   * Format events as a string for AI prompt
   */
  formatEventsString(events) {
    if (!events || events.length === 0) {
      return 'Ingen events';
    }
    
    return events.map(e => e.summary).join(', ');
  }
}

module.exports = new GoogleCalendarService();
