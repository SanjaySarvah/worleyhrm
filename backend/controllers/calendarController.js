const CalendarEntry = require('../models/calendarModel');

exports.createEntry = async (req, res) => {
  try {
    const { date, title, description, type } = req.body;
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    let calendar = await CalendarEntry.findOne({ date: dayStart });

    const newEntry = { title, description, type };

    if (calendar) {
      calendar.entries.push(newEntry);
      await calendar.save();
    } else {
      calendar = await CalendarEntry.create({ date: dayStart, entries: [newEntry] });
    }

    res.status(201).json(calendar);
  } catch (err) {
    console.error("Create Error:", err);
    res.status(400).json({ error: err.message });
  }
};


exports.getEntries = async (req, res) => {
  try {
    const { date } = req.query;

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const entry = await CalendarEntry.findOne({ date: dayStart });
      return res.json(entry || {});
    }

    const all = await CalendarEntry.find({});
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { date } = req.params;
    const { index, title, description, type } = req.body;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const calendar = await CalendarEntry.findOne({ date: dayStart });

    if (!calendar || !calendar.entries[index]) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    calendar.entries[index] = { title, description, type };
    await calendar.save();

    res.json(calendar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.deleteEntry = async (req, res) => {
  try {
    const { date } = req.params;
    const { index } = req.body;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const calendar = await CalendarEntry.findOne({ date: dayStart });

    if (!calendar || !calendar.entries[index]) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    calendar.entries.splice(index, 1);

    // Optionally delete the document if no entries left
    if (calendar.entries.length === 0) {
      await calendar.deleteOne();
      return res.json({ message: 'Entry deleted, date removed as no more entries' });
    } else {
      await calendar.save();
      return res.json({ message: 'Entry deleted', data: calendar });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

