const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all admin routes exclusively for role 'admin'
router.use(ensureAuthenticated);
router.use(authorizeRoles('admin'));

// Admin Dashboard
router.get('/dashboard', adminController.getDashboard);

// Company Management
router.get('/companies', adminController.getCompanies);
router.get('/companies/new', adminController.getNewCompany);
router.post('/companies', adminController.postNewCompany);
router.get('/companies/:id/edit', adminController.getEditCompany);
router.post('/companies/:id/edit', adminController.postEditCompany);
router.post('/companies/:id/delete', adminController.deleteCompany);

// Recruitment Drive Management
router.get('/drives', adminController.getDrives);
router.get('/drives/new', adminController.getNewDrive);
router.post('/drives', adminController.postNewDrive);
router.get('/drives/:id/edit', adminController.getEditDrive);
router.post('/drives/:id/edit', adminController.postEditDrive);
router.post('/drives/:id/delete', adminController.deleteDrive);

// Student Records Management
router.get('/students', adminController.getStudents);
router.get('/students/new', adminController.getNewStudent);
router.post('/students', adminController.postNewStudent);
router.get('/students/:id/edit', adminController.getEditStudent);
router.post('/students/:id/edit', adminController.postEditStudent);
router.post('/students/:id/delete', adminController.deleteStudent);

// Department Management
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.postNewDepartment);
router.post('/departments/:id/delete', adminController.deleteDepartment);

// Announcements Management
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.postNewAnnouncement);
router.post('/announcements/:id/delete', adminController.deleteAnnouncement);

// Placement Records Management
router.get('/placements', adminController.getPlacements);
router.post('/placements', adminController.postNewPlacement);
router.post('/placements/:id/delete', adminController.deletePlacement);

// Reports & Statistics
router.get('/reports', adminController.getReports);

module.exports = router;
