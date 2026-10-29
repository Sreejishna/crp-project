const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getStudentDashboardStats,
  getPlacementAnalytics,
  getPlacementRecords,
  createPlacementRecord,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin-dashboard', protect, authorize('admin'), getAdminDashboardStats);
router.get('/student-dashboard', getStudentDashboardStats);
router.get('/analytics', getPlacementAnalytics);
router.get('/placement-records', getPlacementRecords);
router.post('/placement-records', protect, authorize('admin', 'department'), createPlacementRecord);

module.exports = router;
