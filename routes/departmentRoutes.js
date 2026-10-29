const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { ensureAuthenticated, authorizeRoles } = require('../middleware/authMiddleware');

// Protect department routes (accessible to department coordinators and admin)
router.use(ensureAuthenticated);
router.use(authorizeRoles('department', 'admin'));

router.get('/dashboard', departmentController.getDashboard);
router.get('/students', departmentController.getStudents);
router.get('/drives', departmentController.getDrives);
router.get('/placements', departmentController.getPlacements);
router.get('/statistics', departmentController.getStatistics);

module.exports = router;
