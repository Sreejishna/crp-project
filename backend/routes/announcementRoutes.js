const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements);
router.post('/', protect, authorize('admin', 'department', 'teacher'), createAnnouncement);
router.put('/:id', protect, authorize('admin', 'department', 'teacher'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin', 'department', 'teacher'), deleteAnnouncement);

module.exports = router;
