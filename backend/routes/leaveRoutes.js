const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// POST - apply leave
router.post('/apply', leaveController.applyLeave);

// GET - personal leaves
router.get('/myleaves/:userId', leaveController.getMyLeaves);

// GET - all leaves
router.get('/all', leaveController.getAllLeaves);

// PATCH - update leave status
router.patch('/status/:leaveId', leaveController.updateLeaveStatus);

module.exports = router;
