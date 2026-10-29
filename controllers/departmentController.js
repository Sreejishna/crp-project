const Department = require('../models/Department');
const Student = require('../models/Student');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const PlacementRecord = require('../models/PlacementRecord');
const Announcement = require('../models/Announcement');

/**
 * Helper to get active department for coordinator
 */
const getDepartmentForUser = async (userSession) => {
  if (userSession.departmentId) {
    return await Department.findById(userSession.departmentId);
  }
  // Fallback: first department (MCA)
  return await Department.findOne({ code: 'MCA' });
};

/**
 * Department Dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const department = await getDepartmentForUser(req.session.user);
    if (!department) {
      req.flash('error_msg', 'Department record not found.');
      return res.redirect('/login');
    }

    const totalStudents = await Student.countDocuments({ department: department._id });
    const placedStudents = await Student.countDocuments({
      department: department._id,
      placementStatus: 'Placed',
    });

    // Upcoming drives eligible for this department
    const upcomingDrives = await RecruitmentDrive.find({
      eligibleDepartments: department._id,
      status: { $in: ['Active', 'Upcoming'] },
    })
      .populate('company')
      .sort({ startDate: 1 });

    // Recent placement records
    const recentPlacements = await PlacementRecord.find()
      .populate({
        path: 'student',
        match: { department: department._id },
        select: 'name studentId cgpa qualification',
      })
      .populate('company')
      .sort({ placedDate: -1 })
      .limit(5);

    // Filter out records where student is null (not from this department)
    const deptPlacements = recentPlacements.filter((p) => p.student !== null);

    // Department announcements
    const announcements = await Announcement.find({
      $or: [{ department: null }, { department: department._id }],
    })
      .sort({ date: -1 })
      .limit(5);

    res.render('department/dashboard', {
      title: `${department.code} Department Dashboard | CRP`,
      department,
      totalStudents,
      placedStudents,
      upcomingDrivesCount: upcomingDrives.length,
      upcomingDrives: upcomingDrives.slice(0, 4),
      deptPlacements,
      announcements,
    });
  } catch (err) {
    console.error('Department dashboard error:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View Students Belonging to this Department
 */
exports.getStudents = async (req, res) => {
  try {
    const department = await getDepartmentForUser(req.session.user);
    const { search, status } = req.query;

    const query = { department: department._id };

    if (status && status !== 'All') {
      query.placementStatus = status;
    }

    let students = await Student.find(query).sort({ cgpa: -1 });

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.studentId.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    }

    res.render('department/students', {
      title: `${department.code} Students Roster | CRP`,
      department,
      students,
      searchQuery: search || '',
      selectedStatus: status || 'All',
    });
  } catch (err) {
    console.error('Error loading department students:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View Department-Wise Recruitment Drives & Eligibility Criteria
 */
exports.getDrives = async (req, res) => {
  try {
    const department = await getDepartmentForUser(req.session.user);
    const { season, status } = req.query;

    const filter = {
      eligibleDepartments: department._id,
    };

    if (season && season !== 'All') {
      filter.hiringSeason = season;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    const drives = await RecruitmentDrive.find(filter)
      .populate('company')
      .populate('eligibleDepartments')
      .sort({ startDate: 1 });

    // For each drive, calculate eligible student count in this department
    const departmentStudents = await Student.find({ department: department._id });

    const drivesWithStats = drives.map((drive) => {
      const eligibleCount = departmentStudents.filter(
        (s) => s.cgpa >= drive.minCgpa && s.activeBacklogs <= drive.maxBacklogs
      ).length;

      return {
        ...drive.toObject(),
        eligibleStudentCount: eligibleCount,
        totalDeptStudents: departmentStudents.length,
      };
    });

    res.render('department/drives', {
      title: `${department.code} Eligible Recruitment Drives | CRP`,
      department,
      drives: drivesWithStats,
      selectedSeason: season || 'All',
      selectedStatus: status || 'All',
    });
  } catch (err) {
    console.error('Error loading department drives:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View Department Placement Records
 */
exports.getPlacements = async (req, res) => {
  try {
    const department = await getDepartmentForUser(req.session.user);

    const allRecords = await PlacementRecord.find()
      .populate({
        path: 'student',
        match: { department: department._id },
        select: 'name studentId cgpa qualification email phone',
      })
      .populate('company')
      .sort({ placedDate: -1 });

    const records = allRecords.filter((r) => r.student !== null);

    res.render('department/placements', {
      title: `${department.code} Placement Records | CRP`,
      department,
      records,
    });
  } catch (err) {
    console.error('Error loading department placements:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View Department Placement Statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const department = await getDepartmentForUser(req.session.user);

    const totalStudents = await Student.countDocuments({ department: department._id });
    const placedStudents = await Student.countDocuments({
      department: department._id,
      placementStatus: 'Placed',
    });

    const unplacedStudents = totalStudents - placedStudents;
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    // Placements list for top companies
    const allRecords = await PlacementRecord.find()
      .populate({
        path: 'student',
        match: { department: department._id },
      })
      .populate('company');

    const deptRecords = allRecords.filter((r) => r.student !== null);

    // Company-wise counts
    const companyCounts = {};
    deptRecords.forEach((r) => {
      const cName = r.company ? r.company.name : 'Unknown';
      companyCounts[cName] = (companyCounts[cName] || 0) + 1;
    });

    res.render('department/statistics', {
      title: `${department.code} Placement Statistics | CRP`,
      department,
      totalStudents,
      placedStudents,
      unplacedStudents,
      placementRate,
      deptRecords,
      companyCounts,
    });
  } catch (err) {
    console.error('Error loading department statistics:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};
