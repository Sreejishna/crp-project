const Department = require('../models/Department');
const User = require('../models/User');
const Company = require('../models/Company');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const PlacementRecord = require('../models/PlacementRecord');
const Announcement = require('../models/Announcement');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Attach dynamic student counts and placed student counts
    const populated = await Promise.all(
      departments.map(async (dept) => {
        const studentCount = await User.countDocuments({ department: dept._id, role: 'student' });
        const placedCount = await PlacementRecord.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          totalStudents: studentCount,
          placedStudents: placedCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: populated.length,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public / Authenticated
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const students = await User.find({ department: department._id, role: 'student' })
      .select('-password')
      .sort({ cgpa: -1, name: 1 });

    const placedRecords = await PlacementRecord.find({ department: department._id })
      .populate('company', 'name logo tier')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        students,
        placedRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department (Admin only)
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, hodName, hodEmail, hodPhone, description } = req.body;

    const exists = await Department.findOne({
      $or: [{ name }, { code: code.toUpperCase() }],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name or code already exists.',
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      hodName,
      hodEmail,
      hodPhone: hodPhone || '',
      description: description || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully!',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department (Admin only)
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully!',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department (Admin only)
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await department.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Department removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students belonging to logged-in department
// @route   GET /api/departments/my/students
// @access  Private (Department / Admin)
const getDepartmentStudents = async (req, res, next) => {
  try {
    let departmentId = req.user.department ? (req.user.department._id || req.user.department) : req.query.departmentId;

    if (!departmentId && req.user.role === 'admin' && req.query.departmentId) {
      departmentId = req.query.departmentId;
    }

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'No department assigned to this coordinator. Please contact Admin.',
      });
    }

    const { search, minCgpa, isPlaced, skills } = req.query;
    const query = { department: departmentId, role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { usn: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (minCgpa) {
      query.cgpa = { $gte: Number(minCgpa) };
    }

    if (isPlaced !== undefined && isPlaced !== '') {
      query.isPlaced = isPlaced === 'true';
    }

    if (skills) {
      query.skills = { $in: [new RegExp(skills, 'i')] };
    }

    const students = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .sort({ cgpa: -1, name: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Find Eligible Students for a given Company / Recruitment Drive
// @route   GET /api/departments/eligible-students/:driveOrCompanyId
// @access  Private (Department / Admin)
const getEligibleStudentsForDrive = async (req, res, next) => {
  try {
    const { driveOrCompanyId } = req.params;
    let departmentId = req.user.department ? (req.user.department._id || req.user.department) : req.query.departmentId;

    // Try finding drive first, otherwise company
    let minCgpa = 6.0;
    let minTenth = 60;
    let minTwelfth = 60;
    let maxBacklogs = 0;
    let targetTitle = 'Recruitment Drive';
    let companyName = '';
    let requiredSkills = [];

    const drive = await RecruitmentDrive.findById(driveOrCompanyId).populate('company');
    if (drive) {
      minCgpa = drive.minCgpa || 6.5;
      minTenth = drive.minTenth || 60;
      minTwelfth = drive.minTwelfth || 60;
      maxBacklogs = drive.maxBacklogsAllowed || 0;
      targetTitle = drive.driveTitle;
      companyName = drive.company ? drive.company.name : '';
      if (drive.company && drive.company.requiredSkills) {
        requiredSkills = drive.company.requiredSkills;
      }
    } else {
      const company = await Company.findById(driveOrCompanyId);
      if (company) {
        minCgpa = company.eligibilityCriteria?.minCgpa || 7.0;
        minTenth = company.eligibilityCriteria?.minTenth || 60;
        minTwelfth = company.eligibilityCriteria?.minTwelfth || 60;
        maxBacklogs = company.eligibilityCriteria?.maxBacklogs || 0;
        targetTitle = company.name;
        companyName = company.name;
        requiredSkills = company.requiredSkills || [];
      } else {
        return res.status(404).json({ success: false, message: 'Drive or Company not found' });
      }
    }

    // Query students in this department (or all departments if admin)
    const query = { role: 'student' };
    if (departmentId) {
      query.department = departmentId;
    }

    const allStudents = await User.find(query)
      .select('-password')
      .populate('department', 'name code');

    // Categorize students: Eligible vs Ineligible with reason
    const eligibleStudents = [];
    const ineligibleStudents = [];

    allStudents.forEach((st) => {
      const reasons = [];
      if (st.cgpa < minCgpa) {
        reasons.push(`CGPA (${st.cgpa}) < Required (${minCgpa})`);
      }
      if (st.activeBacklogs > maxBacklogs) {
        reasons.push(`Active Backlogs (${st.activeBacklogs}) > Allowed (${maxBacklogs})`);
      }
      if (st.tenthPercentage < minTenth) {
        reasons.push(`10th Mark (${st.tenthPercentage}%) < Required (${minTenth}%)`);
      }
      if (st.twelfthPercentage < minTwelfth) {
        reasons.push(`12th/Diploma (${st.twelfthPercentage}%) < Required (${minTwelfth}%)`);
      }

      // Check skill matches
      const studentSkills = st.skills || [];
      const matchedSkills = requiredSkills.filter((reqSkill) =>
        studentSkills.some((s) => s.toLowerCase().includes(reqSkill.toLowerCase()))
      );

      const studentData = {
        ...st.toObject(),
        matchedSkills,
        skillMatchPercent: requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 100,
        ineligibleReasons: reasons,
      };

      if (reasons.length === 0) {
        eligibleStudents.push(studentData);
      } else {
        ineligibleStudents.push(studentData);
      }
    });

    return res.status(200).json({
      success: true,
      criteria: {
        targetTitle,
        companyName,
        minCgpa,
        minTenth,
        minTwelfth,
        maxBacklogs,
        requiredSkills,
      },
      stats: {
        totalEvaluated: allStudents.length,
        eligibleCount: eligibleStudents.length,
        ineligibleCount: ineligibleStudents.length,
        eligibilityRate: allStudents.length > 0 ? Math.round((eligibleStudents.length / allStudents.length) * 100) : 0,
      },
      eligibleStudents,
      ineligibleStudents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Department Dashboard Overview
// @route   GET /api/departments/my/dashboard
// @access  Private (Department / Admin)
const getDepartmentDashboard = async (req, res, next) => {
  try {
    let departmentId = req.user.department ? (req.user.department._id || req.user.department) : null;
    let deptInfo = null;

    if (departmentId) {
      deptInfo = await Department.findById(departmentId);
    } else {
      // Fallback for demo or admin
      deptInfo = await Department.findOne();
      if (deptInfo) departmentId = deptInfo._id;
    }

    const totalStudents = await User.countDocuments({ department: departmentId, role: 'student' });
    const placedStudents = await User.countDocuments({ department: departmentId, role: 'student', isPlaced: true });
    const unplacedStudents = totalStudents - placedStudents;

    // Upcoming seasonal drives
    const upcomingDrives = await RecruitmentDrive.find({
      $or: [
        { eligibleDepartments: departmentId },
        { eligibleDepartments: { $exists: true, $size: 0 } },
      ],
      driveStartDate: { $gte: new Date() },
    })
      .populate('company', 'name logo tier defaultLocation hiringSeason')
      .sort({ driveStartDate: 1 })
      .limit(6);

    // Seasonal opportunities count
    const seasonalOpportunities = await Company.aggregate([
      {
        $group: {
          _id: '$hiringSeason',
          count: { $sum: 1 },
          avgSalary: { $avg: '$stipendMonthly' },
        },
      },
    ]);

    // Placement records for this dept
    const recentPlacements = await PlacementRecord.find({ department: departmentId })
      .populate('company', 'name logo tier')
      .sort({ createdAt: -1 })
      .limit(10);

    // Announcements shared by or for this department
    const announcements = await Announcement.find({
      $or: [{ department: departmentId }, { targetAudience: 'All Students' }, { targetAudience: deptInfo ? deptInfo.code : 'MCA' }],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      department: deptInfo,
      stats: {
        totalStudents,
        placedStudents,
        unplacedStudents,
        placementPercentage: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
        upcomingDrivesCount: upcomingDrives.length,
      },
      upcomingDrives,
      seasonalOpportunities,
      recentPlacements,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStudents,
  getEligibleStudentsForDrive,
  getDepartmentDashboard,
};
