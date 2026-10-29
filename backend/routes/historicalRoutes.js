const express = require('express');
const router = express.Router();
const {
  getCompanyHistoricalAnalysis,
  getCyclicCalendar,
  getAllHistoricalRecords,
  createHistoricalRecord,
  updateHistoricalRecord,
  deleteHistoricalRecord,
  getPatternsSummary,
} = require('../controllers/historicalController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public / Authenticated read routes
router.get('/calendar', getCyclicCalendar);
router.get('/patterns-summary', getPatternsSummary);
router.get('/company/:companyId', getCompanyHistoricalAnalysis);

// Admin-managed routes
router.get('/', protect, authorize('admin', 'department', 'teacher'), getAllHistoricalRecords);
router.post('/', protect, authorize('admin'), createHistoricalRecord);
router.put('/:id', protect, authorize('admin'), updateHistoricalRecord);
router.delete('/:id', protect, authorize('admin'), deleteHistoricalRecord);

module.exports = router;
