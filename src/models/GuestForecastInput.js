const mongoose = require('mongoose');

const guestForecastInputSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  weekday: {
    type: String,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  precipitation: {
    type: Number,
    default: 0
  },
  wind_speed: {
    type: Number,
    required: true
  },
  weather_description: {
    type: String,
    required: true
  },
  ferry_capacity: {
    type: Number,
    required: true
  },
  ferry_expected_passengers: {
    type: Number,
    required: true
  },
  event: {
    type: String,
    default: 'Ingen events'
  },
  is_holiday: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GuestForecastInput', guestForecastInputSchema);
