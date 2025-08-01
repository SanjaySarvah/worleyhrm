const mongoose = require('mongoose');

const calendarEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['holiday', 'event', 'reminder', 'custom'],
    default: 'custom'
  }
}, { timestamps: true });

module.exports = mongoose.model('CalendarEntry', calendarEntrySchema);
