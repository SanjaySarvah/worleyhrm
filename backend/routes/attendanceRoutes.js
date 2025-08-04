const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/bulk', attendanceController.bulkMarkAttendance);
router.put('/update-single', attendanceController.updateSingleAttendance);
router.get('/daily', attendanceController.getDailyAttendance);
router.get('/monthly-summary', attendanceController.getMonthlySummary);
router.get('/monthly-summary-detailed', attendanceController.getMonthlySummaryDetailed);
router.get('/monthly-daily-history', attendanceController.getMonthlyDailyHistory);

module.exports = router;
