const RecruitmentDrive = require('../models/RecruitmentDrive');
const Company = require('../models/Company');
const JobRole = require('../models/JobRole');
const Department = require('../models/Department');

// @desc    Get all recruitment drives with filtering
// @route   GET /api/drives
// @access  Public / Authenticated
const getDrives = async (req, res, next) => {
  try {
    const {
      search,
      season,
      status,
      department,
      type,
      mode,
      upcoming,
      active,
    } = req.query;

    const query = {};

    if (search) {
      query.driveTitle = { $regex: search, $options: 'i' };
    }

    if (season && season !== 'All') {
      query.hiringSeason = { $regex: season, $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      query.driveType = type;
    }

    if (mode && mode !== 'All') {
      query.recruitmentMode = { $regex: mode, $options: 'i' };
    }

    if (department && department !== 'All') {
      query.eligibleDepartments = department;
    }

    const now = new Date();
    if (upcoming === 'true') {
      query.driveStartDate = { $gte: now };
    } else if (active === 'true') {
      query.status = 'Active / In Progress';
    }

    const drives = await RecruitmentDrive.find(query)
      .populate('company', 'name logo website industry tier hiringSeason defaultLocation')
      .populate('eligibleDepartments', 'name code')
      .populate('jobRoles')
      .sort({ driveStartDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: drives.length,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recruitment drive details
// @route   GET /api/drives/:id
// @access  Public / Authenticated
const getDriveById = async (req, res, next) => {
  try {
    const drive = await RecruitmentDrive.findById(req.params.id)
      .populate('company')
      .populate('eligibleDepartments', 'name code hodName hodEmail')
      .populate('jobRoles');

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Recruitment Drive not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new recruitment drive (Admin only)
// @route   POST /api/drives
// @access  Private (Admin)
const createDrive = async (req, res, next) => {
  try {
    const {
      driveTitle,
      companyId,
      jobRoleIds,
      hiringSeason,
      driveType,
      driveStartDate,
      driveEndDate,
      registrationDeadline,
      status,
      recruitmentMode,
      recruitmentLocation,
      eligibleDepartmentIds,
      eligibleDegrees,
      minCgpa,
      minTenth,
      minTwelfth,
      maxBacklogsAllowed,
      targetBatch,
      interviewRounds,
      selectionProcessOverview,
      preparationGuidelines,
      instructionsForStudents,
      salaryRange,
      stipendMonthly,
      totalOpenings,
    } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({ success: false, message: 'Valid company ID is required' });
    }

    const drive = await RecruitmentDrive.create({
      driveTitle,
      company: company._id,
      jobRoles: jobRoleIds || [],
      hiringSeason: hiringSeason || company.hiringSeason,
      driveType: driveType || 'On-Campus Mega Drive',
      driveStartDate: new Date(driveStartDate),
      driveEndDate: new Date(driveEndDate),
      registrationDeadline: new Date(registrationDeadline),
      status: status || 'Upcoming',
      recruitmentMode: recruitmentMode || 'Hybrid (Online Test + Offline Interview)',
      recruitmentLocation: recruitmentLocation || 'Campus Placement Auditorium',
      eligibleDepartments: eligibleDepartmentIds || [],
      eligibleDegrees: eligibleDegrees || ['MCA', 'B.Tech CSE', 'B.Tech ISE', 'B.Tech ECE'],
      minCgpa: Number(minCgpa) || 6.5,
      minTenth: Number(minTenth) || 60,
      minTwelfth: Number(minTwelfth) || 60,
      maxBacklogsAllowed: Number(maxBacklogsAllowed) || 0,
      targetBatch: Number(targetBatch) || 2026,
      interviewRounds: interviewRounds || [
        { roundNumber: 1, roundName: 'Online Aptitude & Coding Test', mode: 'Online', duration: '90 mins', description: 'Quant, Verbal, Logical, 2 DSA questions' },
        { roundNumber: 2, roundName: 'Technical Interview', mode: 'Offline', duration: '45 mins', description: 'Core CS, DSA, and Project deep dive' },
        { roundNumber: 3, roundName: 'HR & Management Interview', mode: 'Offline', duration: '30 mins', description: 'Cultural fit, behavioral evaluation' },
      ],
      selectionProcessOverview: selectionProcessOverview || '',
      preparationGuidelines: preparationGuidelines || '',
      instructionsForStudents: instructionsForStudents || '',
      salaryRange: salaryRange || company.salaryRange,
      stipendMonthly: Number(stipendMonthly) || company.stipendMonthly,
      totalOpenings: Number(totalOpenings) || company.vacancies,
    });

    const populatedDrive = await RecruitmentDrive.findById(drive._id)
      .populate('company', 'name logo tier')
      .populate('eligibleDepartments', 'name code')
      .populate('jobRoles');

    return res.status(201).json({
      success: true,
      message: 'Recruitment drive scheduled successfully!',
      data: populatedDrive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recruitment drive (Admin only)
// @route   PUT /api/drives/:id
// @access  Private (Admin)
const updateDrive = async (req, res, next) => {
  try {
    let drive = await RecruitmentDrive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    drive = await RecruitmentDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('company', 'name logo tier')
      .populate('eligibleDepartments', 'name code')
      .populate('jobRoles');

    return res.status(200).json({
      success: true,
      message: 'Recruitment drive updated successfully!',
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recruitment drive (Admin only)
// @route   DELETE /api/drives/:id
// @access  Private (Admin)
const deleteDrive = async (req, res, next) => {
  try {
    const drive = await RecruitmentDrive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    await drive.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Recruitment drive deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Calendar Events for Seasonal Hiring Calendar
// @route   GET /api/drives/seasonal-calendar
// @access  Public / Authenticated
const getSeasonalCalendar = async (req, res, next) => {
  try {
    const drives = await RecruitmentDrive.find()
      .populate('company', 'name logo tier industry defaultLocation')
      .populate('eligibleDepartments', 'code name')
      .sort({ driveStartDate: 1 });

    const calendarEvents = [];

    drives.forEach((drive) => {
      // Main drive event
      calendarEvents.push({
        id: `drive-${drive._id}`,
        driveId: drive._id,
        title: `${drive.company ? drive.company.name : 'Company'} Drive: ${drive.driveTitle}`,
        companyName: drive.company ? drive.company.name : 'Company',
        companyLogo: drive.company ? drive.company.logo : '',
        start: drive.driveStartDate,
        end: drive.driveEndDate,
        hiringSeason: drive.hiringSeason,
        status: drive.status,
        recruitmentMode: drive.recruitmentMode,
        type: 'drive',
        salaryRange: drive.salaryRange,
        eligibleDepartments: drive.eligibleDepartments,
      });

      // Individual interview rounds
      if (drive.interviewRounds && drive.interviewRounds.length > 0) {
        drive.interviewRounds.forEach((round) => {
          if (round.scheduledDate) {
            calendarEvents.push({
              id: `round-${drive._id}-${round.roundNumber}`,
              driveId: drive._id,
              title: `${drive.company ? drive.company.name : 'Drive'} - Round ${round.roundNumber}: ${round.roundName}`,
              companyName: drive.company ? drive.company.name : 'Company',
              start: round.scheduledDate,
              end: round.scheduledDate,
              hiringSeason: drive.hiringSeason,
              status: drive.status,
              recruitmentMode: round.mode,
              type: 'round',
              roundNumber: round.roundNumber,
              duration: round.duration,
            });
          }
        });
      }
    });

    return res.status(200).json({
      success: true,
      count: calendarEvents.length,
      data: calendarEvents,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  getSeasonalCalendar,
};
