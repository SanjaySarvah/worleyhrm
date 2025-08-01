const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.post('/', calendarController.createEntry);
router.get('/', calendarController.getEntries);
router.put('/:id', calendarController.updateEntry);
router.delete('/:id', calendarController.deleteEntry);

module.exports = router;
