const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  from: { type: String, required: true }, // Format: "HH:mm"
  to: { type: String, required: true }    // Format: "HH:mm"
});

const daySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  permissionHours: [timeLogSchema],
  extraHours: [timeLogSchema],
  totalHours: { type: Number, default: 0 }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  days: [daySchema]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
