const express = require('express');
const upload = require('../middleware/upload'); // ✅ Correct path
const {
  importSalarySheet,
  getMonthlySalaries,
  deleteMonthlySalaries
} = require('../controllers/salarySheetController');

const router = express.Router();

// Route expects a single file with field name 'file'
router.post('/salary-sheet/import', upload.single('file'), importSalarySheet);
router.get('/salary-sheet', getMonthlySalaries);
router.delete('/salary-sheet/:month', deleteMonthlySalaries);

module.exports = router;
