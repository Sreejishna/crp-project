const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const Announcement = require('../models/Announcement');
const studentController = require('../controllers/studentController');

/**
 * Public Landing Page
 */
router.get('/', async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeDrives = await RecruitmentDrive.countDocuments({ status: 'Active' });
    const upcomingDrives = await RecruitmentDrive.countDocuments({ status: 'Upcoming' });

    // 4 Seasonal featured drives
    const featuredDrives = await RecruitmentDrive.find({
      status: { $in: ['Active', 'Upcoming'] },
    })
      .populate('company')
      .populate('eligibleDepartments')
      .sort({ startDate: 1 })
      .limit(6);

    const latestAnnouncements = await Announcement.find({ priority: { $in: ['High', 'Urgent'] } })
      .sort({ date: -1 })
      .limit(3);

    res.render('home', {
      title: 'Cyclic Recruitment Portal | Seasonal Hiring Intelligence',
      totalCompanies,
      activeDrives,
      upcomingDrives,
      featuredDrives,
      latestAnnouncements,
    });
  } catch (err) {
    console.error('Home page error:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
});

/**
 * Seasonal Hiring Calendar Page
 */
router.get('/seasonal-calendar', async (req, res) => {
  try {
    const q1Drives = await RecruitmentDrive.find({ hiringSeason: 'January–March' }).populate('company');
    const q2Drives = await RecruitmentDrive.find({ hiringSeason: 'April–June' }).populate('company');
    const q3Drives = await RecruitmentDrive.find({ hiringSeason: 'July–September' }).populate('company');
    const q4Drives = await RecruitmentDrive.find({ hiringSeason: 'October–December' }).populate('company');

    res.render('seasonal-calendar', {
      title: 'Seasonal Hiring Calendar (Q1 - Q4) | CRP',
      q1Drives,
      q2Drives,
      q3Drives,
      q4Drives,
    });
  } catch (err) {
    console.error('Calendar error:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
});

/**
 * Public Company Catalog & Details
 */
router.get('/companies', studentController.getCompanies);
router.get('/companies/:id', studentController.getCompanyDetails);

module.exports = router;
