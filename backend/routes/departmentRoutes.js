const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStudents,
  getEligibleStudentsForDrive,
  getDepartmentDashboard,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDepartments);
router.get('/my/dashboard', protect, authorize('department', 'teacher', 'admin'), getDepartmentDashboard);
router.get('/my/students', protect, authorize('department', 'teacher', 'admin'), getDepartmentStudents);
router.get('/eligible-students/:driveOrCompanyId', protect, authorize('department', 'teacher', 'admin'), getEligibleStudentsForDrive);
router.get('/:id', getDepartmentById);

// Admin-only management
router.post('/', protect, authorize('admin'), createDepartment);
router.put('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

module.exports = router;
