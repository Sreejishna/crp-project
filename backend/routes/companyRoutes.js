const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getSeasonalOverview,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/seasonal-overview', getSeasonalOverview);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createCompany);
router.put('/:id', protect, authorize('admin'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
