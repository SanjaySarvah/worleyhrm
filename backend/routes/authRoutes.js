const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUser
} = require('../controllers/authController');
const salaryController = require('../controllers/salaryController');
const { getEmployeeList } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// — New endpoints —
router.get('/users', getUsers);
router.patch('/update/:userId', updateUser);


// — Existing salary increment route —
router.post('/:userId/increment', salaryController.addIncrement);
router.get('/employee-list', getEmployeeList);




module.exports = router;
