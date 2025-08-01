const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

router.post('/', createAnnouncement);
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;
