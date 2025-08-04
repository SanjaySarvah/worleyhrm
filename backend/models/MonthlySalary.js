// models/MonthlySalary.js
const mongoose = require('mongoose');

const MonthlySalarySchema = new mongoose.Schema({
  employeeId: String,
  month: String,
  annualCTC: Number,
  grossSalary: Number,
  basic: Number,
  hra: Number,
  fcp: Number,
  pf: Number,
  esi: Number,
  pt: Number,
  tds: Number,
  totalDeduction: Number,
  netSalary: Number,
}, { timestamps: true });

MonthlySalarySchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySalary', MonthlySalarySchema);
