const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  officialMailId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr', 'staff'], required: true },
  designation: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dateOfJoining: { type: Date, required: true },
  initialSalary: { type: Number, required: true },
  formId: { type: String, required: true, unique: true },

  increments: [{
    amount: { type: Number, required: true },
    type: { type: String },
    note: { type: String },
    date: { type: Date, default: Date.now }
  }],
  currentSalary: { type: Number, default: 0 } // Will be auto-calculated
}, { timestamps: true });

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
