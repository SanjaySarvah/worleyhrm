const CalendarDay = require('../models/CalendarDay');

// Get all days for a year
exports.getCalendarByYear = async (req, res) => {
  const { year } = req.params;
  try {
    const days = await CalendarDay.find({ year });
    res.json(days);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar data', error });
  }
};

// Add a new day or override existing
exports.addOrUpdateDay = async (req, res) => {
  const { date, dayOfWeek, type, description, year } = req.body;

  try {
    const updated = await CalendarDay.findOneAndUpdate(
      { date },
      { date, dayOfWeek, type, description, year },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error saving calendar day', error });
  }
};

// Delete a specific day
exports.deleteDay = async (req, res) => {
  const { id } = req.params;
  try {
    await CalendarDay.findByIdAndDelete(id);
    res.json({ message: 'Day deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting day', error });
  }
};



// GET calendar days by year and month
exports.getCalendarByMonth = async (req, res) => {
  const { year, month } = req.params;

  try {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${month}-31`);

    const days = await CalendarDay.find({
      date: { $gte: startDate, $lte: endDate },
      year: parseInt(year)
    });

    res.json(days);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching month data', error });
  }
};