const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const { v4: uuidv4 } = require('uuid');
const Form = require('../models/Form'); // ✅ Make sure the path is correct



// exports.register = async (req, res) => {
//   try {
//     const {
//       employeeId,
//       name,
//       phoneNumber,
//       officialMailId,
//       password,
//       role,
//       designation,
//       gender,
//       dateOfJoining,
//       initialSalary,
//       increments
//     } = req.body;

//     // ✅ Manual validation
//     if (!employeeId || !name || !phoneNumber || !officialMailId || !password || !role ||
//         !designation || !gender || !dateOfJoining || initialSalary == null) {
//       return res.status(400).json({ msg: 'Please fill in all required fields' });
//     }

//     // ✅ Calculate total increment amount
//     const totalIncrements = Array.isArray(increments)
//       ? increments.reduce((sum, inc) => sum + (inc.amount || 0), 0)
//       : 0;

//     const currentSalary = initialSalary + totalIncrements;

//     // ✅ Create new user
//     const user = await User.create({
//       employeeId,
//       name,
//       phoneNumber,
//       officialMailId,
//       password,
//       role,
//       designation,
//       gender,
//       dateOfJoining,
//       initialSalary,
//       increments,
//       currentSalary
//     });

//     res.status(201).json({ msg: 'User registered successfully' });
//   } catch (err) {
//     console.error('Registration Error:', err);
//     res.status(400).json({ msg: err.message });
//   }
// };

exports.register = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      phoneNumber,
      officialMailId,
      password,
      role,
      designation,
      gender,
      dateOfJoining,
      initialSalary,
      increments
    } = req.body;

    // Validation
    if (
      !employeeId || !name || !phoneNumber || !officialMailId || !password || !role ||
      !designation || !gender || !dateOfJoining || initialSalary == null
    ) {
      return res.status(400).json({ msg: 'Please fill in all required fields' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ officialMailId });
    if (existingUser) return res.status(400).json({ msg: 'Official email already exists' });

    // Calculate current salary
    const totalIncrements = Array.isArray(increments)
      ? increments.reduce((sum, inc) => sum + (inc.amount || 0), 0)
      : 0;
    const currentSalary = initialSalary + totalIncrements;

    // Generate a unique formId
    const formId = `FORM-${uuidv4().split('-')[0].toUpperCase()}`;

    // ✅ First create User
    const user = await User.create({
      employeeId,
      name,
      phoneNumber,
      officialMailId,
      password,
      role,
      designation,
      gender,
      dateOfJoining,
      initialSalary,
      increments,
      currentSalary,
      formId // link formId now
    });

    // ✅ Then create Form with user._id
    await Form.create({
      formId,
      userId: user._id,
      personalDetails: {
        name,
        gender
      },
      contactDetails: {
        phoneNumber,
        email: officialMailId
      }
    });

    res.status(201).json({ msg: 'User registered successfully', formId, userId: user._id });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(400).json({ msg: err.message });
  }
};


// exports.login = async (req, res) => {
//   const { officialMailId, password } = req.body;

//   try {
//     const user = await User.findOne({ officialMailId });
//     if (!user) return res.status(404).json({ msg: 'User not found' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: '7d'
//     });

//     res.json({ token, user: { name: user.name, role: user.role, id: user._id } });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };



exports.login = async (req, res) => {
  const { officialMailId, password } = req.body;

  try {
    const user = await User.findOne({ officialMailId });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // ✅ Fetch form using user ID
    const form = await Form.findOne({ userId: user._id });

    res.json({
      token,
      user: {
        name: user.name,
        role: user.role,
        id: user._id,
        formId: form?.formId || null  // will return actual formId if found
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};



exports.forgotPassword = async (req, res) => {
  const { officialMailId } = req.body;
  try {
    const user = await User.findOne({ officialMailId });
    if (!user) return res.status(404).json({ msg: 'Email not found' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await sendEmail(
      officialMailId,
      'Password Reset',
      `Click to reset your password: ${resetLink}`
    );

    res.json({ msg: 'Reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};



exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters long" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // ❌ DO NOT bcrypt.hash() here – the pre('save') hook will do it
    user.password = password;
    await user.save(); // this will trigger your pre('save') hook and hash it once

    return res.json({ msg: "Password has been reset successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ msg: "Error resetting password" });
  }
};



// ✅ Get all users except password
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude hashed password
    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// — UPDATE ONE USER —
exports.updateUser = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      phoneNumber,
      officialMailId,
      password,
      role,
      designation,
      gender,
      dateOfJoining,
      initialSalary,
      increments
    } = req.body;

    // ✅ Validate required fields
    if (!employeeId || !name || !phoneNumber || !officialMailId || !role ||
        !designation || !gender || !dateOfJoining || initialSalary == null) {
      return res.status(400).json({ msg: 'All required fields must be filled' });
    }

    // ✅ Handle password hashing if updated
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // ✅ Calculate currentSalary from initialSalary + increments
    const totalIncrements = Array.isArray(increments)
      ? increments.reduce((sum, inc) => sum + (inc.amount || 0), 0)
      : 0;

    const currentSalary = initialSalary + totalIncrements;

    const updates = {
      employeeId,
      name,
      phoneNumber,
      officialMailId,
      role,
      designation,
      gender,
      dateOfJoining,
      initialSalary,
      increments,
      currentSalary
    };

    if (password) updates.password = hashedPassword;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ msg: 'User updated successfully', data: user });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(400).json({ msg: err.message });
  }
};





// controllers/userController.js
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // mongoose returns array
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// controller/authController.js or userController.js
exports.getEmployeeList = async (req, res) => {
  try {
    const users = await User.find({}, 'employeeId name designation officialMailId phoneNumber currentSalary');
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


