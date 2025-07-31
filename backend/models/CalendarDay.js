const mongoose = require('mongoose');

const calendarDaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  dayOfWeek: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['working-day', 'weekend', 'holiday', 'optional-holiday'],
    default: 'working-day',
  },
  description: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('CalendarDay', calendarDaySchema);
