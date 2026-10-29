const Company = require('../models/Company');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const User = require('../models/User');
const Department = require('../models/Department');
const PlacementRecord = require('../models/PlacementRecord');
const Announcement = require('../models/Announcement');
const SkillRoadmap = require('../models/SkillRoadmap');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/stats/admin-dashboard
// @access  Private (Admin)
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeDrives = await RecruitmentDrive.countDocuments({ status: 'Active / In Progress' });
    const upcomingDrives = await RecruitmentDrive.countDocuments({ status: 'Upcoming' });
    const totalDrives = await RecruitmentDrive.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalDepartments = await Department.countDocuments();
    const placedStudents = await User.countDocuments({ role: 'student', isPlaced: true });
    const totalPlacements = await PlacementRecord.countDocuments();

    // Seasonal breakdown of companies
    const seasonalCompanies = await Company.aggregate([
      {
        $group: {
          _id: '$hiringSeason',
          count: { $sum: 1 },
        },
      },
    ]);

    // Average package
    const avgPackageAgg = await PlacementRecord.aggregate([
      {
        $group: {
          _id: null,
          avgCTC: { $avg: '$packageLPA' },
          maxCTC: { $max: '$packageLPA' },
          minCTC: { $min: '$packageLPA' },
        },
      },
    ]);

    const avgCTC = avgPackageAgg.length > 0 ? avgPackageAgg[0].avgCTC.toFixed(2) : '7.50';
    const maxCTC = avgPackageAgg.length > 0 ? avgPackageAgg[0].maxCTC.toFixed(2) : '24.00';

    // Recent 5 recruitment drives
    const recentDrives = await RecruitmentDrive.find()
      .populate('company', 'name logo tier')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 announcements
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalCompanies,
        activeDrives,
        upcomingDrives,
        totalDrives,
        totalStudents,
        totalDepartments,
        placedStudents,
        unplacedStudents: totalStudents - placedStudents,
        placementPercentage: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
        totalPlacements,
        avgCTC,
        maxCTC,
      },
      seasonalCompanies,
      recentDrives,
      recentAnnouncements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Dashboard Stats & Highlights
// @route   GET /api/stats/student-dashboard
// @access  Public / Authenticated
const getStudentDashboardStats = async (req, res, next) => {
  try {
    const student = req.user && req.user.role === 'student' ? req.user : null;

    // Upcoming seasonal hiring companies
    const upcomingSeasonalDrives = await RecruitmentDrive.find({
      status: { $in: ['Upcoming', 'Active / In Progress'] },
    })
      .populate('company', 'name logo tier industry defaultLocation hiringSeason')
      .populate('eligibleDepartments', 'name code')
      .sort({ driveStartDate: 1 })
      .limit(6);

    // Recently added companies
    const recentlyAddedCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Active recruitment drives count
    const activeDrivesCount = await RecruitmentDrive.countDocuments({
      status: 'Active / In Progress',
    });

    // Total upcoming drives
    const upcomingDrivesCount = await RecruitmentDrive.countDocuments({
      status: 'Upcoming',
    });

    // Recommended skills & roadmaps
    const roadmaps = await SkillRoadmap.find().limit(4);

    // Latest Announcements
    const announcements = await Announcement.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(6);

    // Seasonal breakdown
    const seasonsSummary = [
      {
        quarter: 'Q1',
        seasonName: 'January – March Hiring',
        focus: 'Spring Internships & Conversions',
        badgeClass: 'bg-primary',
        companyCount: await Company.countDocuments({ hiringSeason: /January/i }),
      },
      {
        quarter: 'Q2',
        seasonName: 'April – June Hiring',
        focus: 'Summer Placement Drives & Early Offers',
        badgeClass: 'bg-success',
        companyCount: await Company.countDocuments({ hiringSeason: /April/i }),
      },
      {
        quarter: 'Q3',
        seasonName: 'July – September Hiring',
        focus: 'Autumn Mega Campus Season & Day 1 Giants',
        badgeClass: 'bg-purple',
        companyCount: await Company.countDocuments({ hiringSeason: /July/i }),
      },
      {
        quarter: 'Q4',
        seasonName: 'October – December Hiring',
        focus: 'Winter Dream Drives & Core Engineering',
        badgeClass: 'bg-warning',
        companyCount: await Company.countDocuments({ hiringSeason: /October/i }),
      },
    ];

    return res.status(200).json({
      success: true,
      stats: {
        activeDrivesCount,
        upcomingDrivesCount,
        totalCompanies: await Company.countDocuments(),
      },
      upcomingSeasonalDrives,
      recentlyAddedCompanies,
      roadmaps,
      announcements,
      seasonsSummary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detailed Placement & Recruitment Statistics (For Charts & Visualizations)
// @route   GET /api/stats/analytics
// @access  Public / Authenticated
const getPlacementAnalytics = async (req, res, next) => {
  try {
    // 1. Department-wise Placement Statistics
    const departments = await Department.find();
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const total = await User.countDocuments({ department: dept._id, role: 'student' });
        const placed = await PlacementRecord.countDocuments({ department: dept._id });
        const records = await PlacementRecord.find({ department: dept._id });
        const avg = records.length > 0
          ? (records.reduce((acc, curr) => acc + curr.packageLPA, 0) / records.length).toFixed(1)
          : '0.0';

        return {
          departmentName: dept.name,
          code: dept.code,
          totalStudents: total,
          placedStudents: placed,
          placementRate: total > 0 ? Math.round((placed / total) * 100) : 0,
          avgPackageLPA: Number(avg),
        };
      })
    );

    // 2. Hiring Season Distribution
    const seasonalDistribution = await Company.aggregate([
      {
        $group: {
          _id: '$hiringSeason',
          companyCount: { $sum: 1 },
          totalVacancies: { $sum: '$vacancies' },
        },
      },
    ]);

    // 3. Package Tiers Distribution
    const tierDistribution = await Company.aggregate([
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Industry Breakdown
    const industryBreakdown = await Company.aggregate([
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    return res.status(200).json({
      success: true,
      departmentStats,
      seasonalDistribution,
      tierDistribution,
      industryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Placement Records List
// @route   GET /api/stats/placement-records
// @access  Public / Authenticated
const getPlacementRecords = async (req, res, next) => {
  try {
    const { department, season, search } = req.query;
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (season && season !== 'All') {
      query.placementSeason = { $regex: season, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { usn: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { jobRole: { $regex: search, $options: 'i' } },
      ];
    }

    const records = await PlacementRecord.find(query)
      .populate('department', 'name code')
      .populate('company', 'name logo tier')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Placement Record (Admin / Department)
// @route   POST /api/stats/placement-records
// @access  Private (Admin / Department)
const createPlacementRecord = async (req, res, next) => {
  try {
    const {
      studentId,
      companyId,
      jobRole,
      packageLPA,
      placementSeason,
      placementYear,
      offerType,
      offerDate,
    } = req.body;

    const student = await User.findById(studentId).populate('department');
    if (!student) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({ success: false, message: 'Invalid company ID' });
    }

    const record = await PlacementRecord.create({
      student: student._id,
      studentName: student.name,
      usn: student.usn || 'N/A',
      department: student.department ? student.department._id : null,
      company: company._id,
      companyName: company.name,
      jobRole: jobRole || 'Associate Software Engineer',
      packageLPA: Number(packageLPA) || 6.5,
      placementSeason: placementSeason || company.hiringSeason,
      placementYear: Number(placementYear) || 2026,
      offerType: offerType || 'Full Time (FTE)',
      offerDate: offerDate ? new Date(offerDate) : new Date(),
    });

    // Mark student as placed
    student.isPlaced = true;
    student.placedCompany = company.name;
    student.placedPackage = Number(packageLPA) || 6.5;
    await student.save();

    return res.status(201).json({
      success: true,
      message: `Placement record added for ${student.name}!`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getStudentDashboardStats,
  getPlacementAnalytics,
  getPlacementRecords,
  createPlacementRecord,
};
