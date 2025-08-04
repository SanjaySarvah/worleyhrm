const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['holiday', 'event', 'reminder', 'custom'],
    default: 'custom'
  }
}, { _id: false });

const calendarSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  entries: [entrySchema]
}, { timestamps: true });

module.exports = mongoose.model('CalendarEntry', calendarSchema);
