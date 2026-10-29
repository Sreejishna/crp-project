const User = require('../models/User');
const Department = require('../models/Department');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const Company = require('../models/Company');

// @desc    Get all students (Admin)
// @route   GET /api/students
// @access  Private (Admin)
const getStudents = async (req, res, next) => {
  try {
    const { search, department, degree, isPlaced, minCgpa, batchYear } = req.query;

    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { usn: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (degree && degree !== 'All') {
      query.degree = degree;
    }

    if (batchYear && batchYear !== 'All') {
      query.batchYear = Number(batchYear);
    }

    if (isPlaced !== undefined && isPlaced !== 'All' && isPlaced !== '') {
      query.isPlaced = isPlaced === 'true';
    }

    if (minCgpa) {
      query.cgpa = { $gte: Number(minCgpa) };
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

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Admin / Department)
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' })
      .select('-password')
      .populate('department');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details (Admin)
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudentByAdmin = async (req, res, next) => {
  try {
    let student = await User.findOne({ _id: req.params.id, role: 'student' });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If skills passed as string
    if (typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    student = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('department', 'name code');

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully!',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student (Admin)
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.department) {
      await Department.findByIdAndUpdate(student.department, { $inc: { totalStudents: -1 } });
    }

    await student.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Student record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate student eligibility for a specific Drive or Company
// @route   GET /api/students/check-eligibility/:targetId
// @access  Private (Student)
const checkMyEligibility = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id).populate('department');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { targetId } = req.params;

    // Check if targetId is a RecruitmentDrive or Company
    let drive = await RecruitmentDrive.findById(targetId).populate('company').populate('eligibleDepartments');
    let company = null;

    if (!drive) {
      company = await Company.findById(targetId).populate('eligibilityCriteria.eligibleDepartments');
    } else {
      company = drive.company;
    }

    if (!drive && !company) {
      return res.status(404).json({ success: false, message: 'Opportunity or company record not found.' });
    }

    const reasons = [];
    const suggestions = [];

    // Extract criteria from drive or company
    const minCgpa = drive ? drive.minCgpa : (company.eligibilityCriteria?.minCgpa || 6.5);
    const maxArrears = drive ? drive.maxBacklogsAllowed : (company.eligibilityCriteria?.maxBacklogs !== undefined ? company.eligibilityCriteria.maxBacklogs : 0);
    const minTenth = drive ? drive.minTenth : (company.eligibilityCriteria?.minTenth || 60);
    const minTwelfth = drive ? drive.minTwelfth : (company.eligibilityCriteria?.minTwelfth || 60);
    const allowedYears = drive ? (drive.allowedAcademicYears || [3, 4]) : (company.allowedAcademicYears || [3, 4]);
    const allowedDegrees = drive ? (drive.eligibleDegrees || ['MCA', 'B.Tech CSE']) : (company.requiredQualifications || ['MCA', 'B.Tech CSE']);
    const eligibleDeptList = drive ? (drive.eligibleDepartments || []) : (company.eligibilityCriteria?.eligibleDepartments || []);

    const studentYear = student.academicYear || 4;
    const studentArrears = student.arrears !== undefined ? student.arrears : (student.activeBacklogs || 0);

    // 1. Academic Year Check
    if (allowedYears && allowedYears.length > 0 && !allowedYears.includes(studentYear)) {
      const yearText = allowedYears.map((y) => `${y}${y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year`).join(', ');
      reasons.push(`Not Eligible: This opportunity is restricted to ${yearText} students. You are currently in ${studentYear}${studentYear === 1 ? 'st' : studentYear === 2 ? 'nd' : studentYear === 3 ? 'rd' : 'th'} Year.`);
      suggestions.push(`Focus on building strong fundamentals and projects in your current academic year. Bookmark this company to track recurring drives when you reach eligible year.`);
    }

    // 2. CGPA Check
    if (student.cgpa < minCgpa) {
      reasons.push(`Not Eligible: Your CGPA (${student.cgpa.toFixed(2)}) is below the company's minimum requirement of ${minCgpa.toFixed(2)}.`);
      const diff = (minCgpa - student.cgpa).toFixed(2);
      suggestions.push(`Aim to improve your GPA in upcoming semester exams by at least +${diff} points to cross the cutoff.`);
    }

    // 3. Arrears / Backlogs Check
    if (studentArrears > maxArrears) {
      reasons.push(`Not Eligible: You have ${studentArrears} active arrears (backlogs). Company requires a maximum of ${maxArrears} active arrears.`);
      suggestions.push(`Prioritize clearing all pending backlogs in the upcoming supplementary examination.`);
    }

    // 4. Degree Check
    if (allowedDegrees && allowedDegrees.length > 0 && student.degree) {
      const hasDegree = allowedDegrees.some(
        (deg) => deg.toLowerCase().includes(student.degree.toLowerCase()) || student.degree.toLowerCase().includes(deg.toLowerCase())
      );
      if (!hasDegree) {
        reasons.push(`Not Eligible: Drive is configured for degrees [${allowedDegrees.join(', ')}]. Your degree is ${student.degree}.`);
      }
    }

    // 5. Department Check
    if (eligibleDeptList && eligibleDeptList.length > 0) {
      if (!student.department) {
        reasons.push('Not Eligible: Your department is not yet assigned. Please update your profile.');
      } else {
        const hasDept = eligibleDeptList.some(
          (d) => (d._id || d).toString() === student.department._id.toString()
        );
        if (!hasDept) {
          const deptNames = eligibleDeptList.map((d) => d.name || d.code || 'Department').join(', ');
          reasons.push(`Not Eligible: Drive is open only for departments: ${deptNames}. Your department (${student.department.name}) is not eligible.`);
        }
      }
    }

    // 6. 10th Standard Percentage
    if (student.tenthPercentage && student.tenthPercentage < minTenth) {
      reasons.push(`Not Eligible: Your 10th standard score (${student.tenthPercentage}%) is below the minimum requirement of ${minTenth}%.`);
    }

    // 7. 12th / Diploma Percentage
    const higherSecondaryScore = Math.max(student.twelfthPercentage || 0, student.diplomaPercentage || 0);
    if (higherSecondaryScore && higherSecondaryScore < minTwelfth) {
      reasons.push(`Not Eligible: Your 12th/Diploma score (${higherSecondaryScore}%) is below the minimum requirement of ${minTwelfth}%.`);
    }

    const isEligible = reasons.length === 0;
    const statusMessage = isEligible
      ? 'Eligible: You meet the currently configured eligibility criteria.'
      : reasons[0]; // Primary highlighted reason

    // Add general preparation suggestions if eligible
    if (isEligible) {
      suggestions.push('Review company interview rounds and practice Data Structures & Algorithms.');
      suggestions.push('Prepare clean project explanations using the STAR (Situation, Task, Action, Result) methodology.');
      suggestions.push('Verify that your resume matches the required skill keywords for this role.');
    }

    return res.status(200).json({
      success: true,
      isEligible,
      statusMessage,
      reasons,
      suggestions,
      studentDetails: {
        id: student._id,
        name: student.name,
        usn: student.usn,
        cgpa: student.cgpa,
        academicYear: studentYear,
        arrears: studentArrears,
        department: student.department?.name,
        degree: student.degree,
      },
      requirements: {
        targetName: drive ? drive.driveTitle : company.name,
        companyName: company?.name || 'Company',
        minCgpa,
        maxArrears,
        minTenth,
        minTwelfth,
        allowedYears,
        allowedDegrees,
        salary: drive ? drive.salaryRange : company.salaryRange,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark for a company (Wishlist / Tracking)
// @route   POST /api/students/bookmarks/company/:companyId
// @access  Private (Student)
const toggleBookmarkCompany = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { companyId } = req.params;
    const bookmarks = student.bookmarkedCompanies || [];
    const index = bookmarks.findIndex((id) => id.toString() === companyId);

    let isBookmarked = false;
    if (index > -1) {
      bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      bookmarks.push(companyId);
      isBookmarked = true;
    }

    student.bookmarkedCompanies = bookmarks;
    await student.save();

    return res.status(200).json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Company added to your tracked wishlist!' : 'Company removed from tracked wishlist.',
      count: bookmarks.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's bookmarked companies
// @route   GET /api/students/bookmarks
// @access  Private (Student)
const getMyBookmarks = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id).populate({
      path: 'bookmarkedCompanies',
      select: 'name logo industry tier hiringSeason seasonQuarter salaryRange recruitmentStatus cyclicPattern',
    });

    return res.status(200).json({
      success: true,
      count: student.bookmarkedCompanies?.length || 0,
      data: student.bookmarkedCompanies || [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudentByAdmin,
  deleteStudent,
  checkMyEligibility,
  toggleBookmarkCompany,
  getMyBookmarks,
};

