const express = require('express');
const router = express.Router();
const {
  applyForDrive,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  withdrawApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply/:driveId', protect, authorize('student'), applyForDrive);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.delete('/:id', protect, authorize('student'), withdrawApplication);

router.get('/', protect, authorize('admin', 'department'), getAllApplications);
router.put('/:id/status', protect, authorize('admin', 'department'), updateApplicationStatus);

module.exports = router;
