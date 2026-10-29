const Application = require('../models/Application');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const Company = require('../models/Company');
const User = require('../models/User');

// @desc    Apply for a Recruitment Drive (Student)
// @route   POST /api/applications/apply/:driveId
// @access  Private (Student)
const applyForDrive = async (req, res, next) => {
  try {
    const { driveId } = req.params;
    const { notes, resumeLink } = req.body;
    const studentId = req.user._id;

    const drive = await RecruitmentDrive.findById(driveId).populate('company');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Recruitment drive not found.' });
    }

    // Check if drive is active
    if (drive.status === 'Completed' || drive.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This recruitment drive is no longer accepting applications.' });
    }

    // Check if already applied
    const existing = await Application.findOne({ student: studentId, drive: driveId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this drive.',
        application: existing,
      });
    }

    const application = await Application.create({
      student: studentId,
      drive: driveId,
      company: drive.company._id,
      notes: notes || '',
      resumeLink: resumeLink || req.user.linkedinProfile || '',
      status: 'Applied',
    });

    const populated = await Application.findById(application._id)
      .populate('drive')
      .populate('company');

    return res.status(201).json({
      success: true,
      message: `Successfully applied to ${drive.company.name} for drive "${drive.title}"!`,
      application: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Student's Applications
// @route   GET /api/applications/my-applications
// @access  Private (Student)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'drive',
        populate: { path: 'jobRoles' },
      })
      .populate('company')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Applications (Admin & Department)
// @route   GET /api/applications
// @access  Private (Admin, Department)
const getAllApplications = async (req, res, next) => {
  try {
    const { driveId, companyId, status, departmentId } = req.query;
    const filter = {};

    if (driveId) filter.drive = driveId;
    if (companyId) filter.company = companyId;
    if (status) filter.status = status;

    let applications = await Application.find(filter)
      .populate('student', 'name email phone usn student_id degree cgpa activeBacklogs department skills isPlaced')
      .populate('drive', 'title season quarter packageRange venue driveStartDate registrationDeadline status')
      .populate('company', 'name logo website packageTier industry')
      .sort({ createdAt: -1 });

    // Filter by department if requested or if department coordinator
    if (req.user.role === 'department' && req.user.department) {
      applications = applications.filter(
        (app) => app.student && app.student.department && app.student.department.toString() === req.user.department._id.toString()
      );
    } else if (departmentId) {
      applications = applications.filter(
        (app) => app.student && app.student.department && app.student.department.toString() === departmentId
      );
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Application Status (Admin & Department)
// @route   PUT /api/applications/:id/status
// @access  Private (Admin, Department)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;

    const application = await Application.findByIdAndUpdate(id, updateData, { new: true })
      .populate('student', 'name email usn student_id')
      .populate('drive', 'title')
      .populate('company', 'name');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // If marked Selected, optionally mark student isPlaced
    if (status === 'Selected' && application.student) {
      await User.findByIdAndUpdate(application.student._id, {
        isPlaced: true,
        placedCompany: application.company ? application.company.name : 'Placed',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to "${status}"!`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw Application (Student)
// @route   DELETE /api/applications/:id
// @access  Private (Student)
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
    }

    await Application.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForDrive,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  withdrawApplication,
};
