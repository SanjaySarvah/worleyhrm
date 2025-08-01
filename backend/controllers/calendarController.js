const CalendarEntry = require('../models/calendarModel');

// Create
exports.createEntry = async (req, res) => {
  try {
    const entry = await CalendarEntry.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    console.error("Create Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Read all or by date
exports.getEntries = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};

    if (date) {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dayStart, $lte: dayEnd };
    }

    const entries = await CalendarEntry.find(query);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateEntry = async (req, res) => {
  try {
    const updated = await CalendarEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Entry not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteEntry = async (req, res) => {
  try {
    const deleted = await CalendarEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
