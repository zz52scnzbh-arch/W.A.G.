const mongoose = require('mongoose');

const guestForecastResultSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
    unique: true
  },
  predicted_guests: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  explanation: {
    type: String,
    required: true
  },
  suggestions: {
    staffing: {
      type: String,
      required: true
    },
    ingredients: [{
      type: String
    }],
    open_hours: {
      type: String,
      required: true
    }
  },
  input_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuestForecastInput'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GuestForecastResult', guestForecastResultSchema);
