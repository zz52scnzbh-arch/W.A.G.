const mongoose = require('mongoose');

const actualGuestLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
    unique: true
  },
  actual_guests: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  },
  forecast_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuestForecastResult'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActualGuestLog', actualGuestLogSchema);
