const Announcement = require('../models/announcementModel');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, createdBy, isActive } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      createdBy,
      isActive,
    });

    req.io.emit('announcement:new', announcement); // Broadcast via WebSocket
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });

    req.io.emit('announcement:update', updated); // Broadcast update
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    req.io.emit('announcement:delete', deleted._id); // Broadcast deletion
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
