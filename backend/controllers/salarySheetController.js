// controllers/salarySheetController.js
const XLSX = require('xlsx');
const MonthlySalary = require('../models/MonthlySalary');

exports.importSalarySheet = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Excel file is required' });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const { month } = req.body;

    const inserted = await Promise.all(rows.map(async (row) => {
      const data = {
        employeeId: row['EmployeeId'],
        month,
        annualCTC: row['Annual CTC'],
        grossSalary: row['Gross Salary'],
        basic: row['Basic'],
        hra: row['HRA'],
        fcp: row['FCP'],
        pf: row['PF'],
        esi: row['ESI'],
        pt: row['PT'],
        tds: row['TDS'],
        totalDeduction: row['Total Deduction'],
        netSalary: row['Net Salary']
      };

      return await MonthlySalary.findOneAndUpdate(
        { employeeId: data.employeeId, month },
        data,
        { upsert: true, new: true }
      );
    }));

    res.status(200).json({ message: 'Sheet imported successfully', count: inserted.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Import failed' });
  }
};

exports.getMonthlySalaries = async (req, res) => {
  const { month } = req.query;
  const filter = month ? { month } : {};
  const data = await MonthlySalary.find(filter);
  res.json(data);
};

exports.deleteMonthlySalaries = async (req, res) => {
  const { month } = req.params;
  await MonthlySalary.deleteMany({ month });
  res.json({ message: `Deleted salaries for ${month}` });
};
