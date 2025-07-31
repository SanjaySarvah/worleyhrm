const mongoose = require('mongoose');

const workingExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  designation: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  experienceLetter: { type: String },
  relievingLetter: { type: String },
  payslip: { type: String }
}, { _id: true, timestamps: true });

const formSchema = new mongoose.Schema({
  formId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},


  personalDetails: {
    name: String,
    profileImage: String,
    fatherName: String,
    bloodGroup: String,
    aadhaarCard: String,
    passport: String,
    panCard: String,
    gender: String,
    dob: Date,
    maritalStatus: String,
    nationality: String,
    aadhaarNumber: String,
    panNumber: String,
    passportNumber: String
  },

  contactDetails: {
    phoneNumber: String,
    email: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    presentAddress: String,
    permanentAddress: String,
    alternateContactNumber: String
  },

  workingDetails: {
    pfNumber: String,
    esiNumber: String,
    experiences: [workingExperienceSchema]
  },

  bankDetails: {
    bankName: String,
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    branchName: String,
    bankPassbook: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);
