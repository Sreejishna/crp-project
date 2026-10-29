const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  updateStudentByAdmin,
  deleteStudent,
  checkMyEligibility,
  toggleBookmarkCompany,
  getMyBookmarks,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/bookmarks', protect, authorize('student'), getMyBookmarks);
router.post('/bookmarks/company/:companyId', protect, authorize('student'), toggleBookmarkCompany);
router.get('/check-eligibility/:targetId', protect, checkMyEligibility);
router.get('/', protect, authorize('admin', 'department', 'teacher'), getStudents);
router.get('/:id', protect, authorize('admin', 'department', 'teacher'), getStudentById);
router.put('/:id', protect, authorize('admin'), updateStudentByAdmin);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
