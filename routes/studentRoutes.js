const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { ensureAuthenticated, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all student routes
router.use(ensureAuthenticated);
router.use(authorizeRoles('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.post('/profile', studentController.updateProfile);
router.get('/drives', studentController.getDrives);
router.get('/roadmaps', studentController.getRoadmaps);

module.exports = router;
