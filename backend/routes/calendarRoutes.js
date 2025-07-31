const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');


router.get('/:year/:month', calendarController.getCalendarByMonth); // <-- New route
router.get('/:year', calendarController.getCalendarByYear);
router.post('/', calendarController.addOrUpdateDay);
router.delete('/:id', calendarController.deleteDay);

module.exports = router;
