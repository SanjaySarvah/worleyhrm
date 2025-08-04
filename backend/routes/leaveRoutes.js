const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

// STAFF: Apply leave
router.post('/apply', protect(['staff', 'hr', 'admin']), leaveController.applyLeave);

// STAFF: Get my leaves
router.get('/myleaves', protect(['staff', 'hr', 'admin']), leaveController.getMyLeaves);

// HR/Admin: Get all leaves
router.get('/all', protect(['hr', 'admin']), leaveController.getAllLeaves);

// HR/Admin: Update leave status
router.patch('/status/:leaveId', protect(['hr', 'admin']), leaveController.updateLeaveStatus);

module.exports = router;
