const express = require('express');
const router = express.Router();
const {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  getSeasonalCalendar,
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/seasonal-calendar', getSeasonalCalendar);
router.get('/', getDrives);
router.get('/:id', getDriveById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createDrive);
router.put('/:id', protect, authorize('admin'), updateDrive);
router.delete('/:id', protect, authorize('admin'), deleteDrive);

module.exports = router;
