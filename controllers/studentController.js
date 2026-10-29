const Student = require('../models/Student');
const Company = require('../models/Company');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const Announcement = require('../models/Announcement');
const Department = require('../models/Department');

/**
 * Student Dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user.id })
      .populate('department');

    const totalCompanies = await Company.countDocuments();
    const activeDrives = await RecruitmentDrive.countDocuments({ status: 'Active' });
    const upcomingDrives = await RecruitmentDrive.countDocuments({ status: 'Upcoming' });

    // Recent announcements (general or for student's department)
    const announcements = await Announcement.find({
      $or: [
        { department: null },
        { department: student ? student.department._id : null },
      ],
    })
      .sort({ date: -1 })
      .limit(5);

    // Recent seasonal drives
    const featuredDrives = await RecruitmentDrive.find({ status: { $in: ['Active', 'Upcoming'] } })
      .populate('company')
      .populate('eligibleDepartments')
      .sort({ startDate: 1 })
      .limit(4);

    res.render('student/dashboard', {
      title: 'Student Dashboard | Cyclic Recruitment Portal',
      student,
      totalCompanies,
      activeDrives,
      upcomingDrives,
      announcements,
      featuredDrives,
    });
  } catch (err) {
    console.error('Error loading student dashboard:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View & Update Profile
 */
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user.id })
      .populate('department');

    const departments = await Department.find().sort({ code: 1 });

    res.render('student/profile', {
      title: 'My Profile | Student Portal',
      student,
      departments,
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      qualification,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      skills,
      github,
      linkedin,
    } = req.body;

    const student = await Student.findOne({ user: req.session.user.id });
    if (!student) {
      req.flash('error_msg', 'Student profile not found.');
      return res.redirect('/student/dashboard');
    }

    const parsedSkills = skills
      ? skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : student.skills;

    student.name = name || student.name;
    student.phone = phone || student.phone;
    student.qualification = qualification || student.qualification;
    if (cgpa !== undefined) student.cgpa = parseFloat(cgpa);
    if (tenthPercentage !== undefined) student.tenthPercentage = parseFloat(tenthPercentage);
    if (twelfthPercentage !== undefined) student.twelfthPercentage = parseFloat(twelfthPercentage);
    if (activeBacklogs !== undefined) student.activeBacklogs = parseInt(activeBacklogs);
    student.skills = parsedSkills;
    student.github = github || student.github;
    student.linkedin = linkedin || student.linkedin;

    await student.save();

    req.flash('success_msg', 'Profile updated successfully!');
    res.redirect('/student/profile');
  } catch (err) {
    console.error('Error updating profile:', err);
    req.flash('error_msg', 'Failed to update profile: ' + err.message);
    res.redirect('/student/profile');
  }
};

/**
 * View All Companies with Search & Seasonal Filters
 */
exports.getCompanies = async (req, res) => {
  try {
    const { search, season, industry } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { industry: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (industry && industry !== 'All') {
      query.industry = { $regex: industry, $options: 'i' };
    }

    const companies = await Company.find(query).sort({ name: 1 });

    // Fetch related active recruitment drives for each company
    const drives = await RecruitmentDrive.find().populate('company');

    // Filter drives by season if specified
    let filteredDrives = drives;
    if (season && season !== 'All') {
      filteredDrives = drives.filter((d) => d.hiringSeason === season);
    }

    // Extract distinct industries for filter dropdown
    const allIndustries = await Company.distinct('industry');

    res.render('companies/list', {
      title: 'Seasonal Companies Catalog | CRP',
      companies,
      drives: filteredDrives,
      selectedSeason: season || 'All',
      selectedIndustry: industry || 'All',
      searchQuery: search || '',
      allIndustries,
    });
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View Single Company Details
 */
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      req.flash('error_msg', 'Company not found.');
      return res.redirect('/companies');
    }

    const drives = await RecruitmentDrive.find({ company: company._id })
      .populate('eligibleDepartments')
      .sort({ startDate: 1 });

    const student = req.session.user && req.session.user.role === 'student'
      ? await Student.findOne({ user: req.session.user.id })
      : null;

    res.render('companies/details', {
      title: `${company.name} | Recruitment Information`,
      company,
      drives,
      student,
    });
  } catch (err) {
    console.error('Error fetching company details:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View All Upcoming & Seasonal Recruitment Drives
 */
exports.getDrives = async (req, res) => {
  try {
    const { season, status, search } = req.query;

    const student = await Student.findOne({ user: req.session.user.id });

    const filter = {};
    if (season && season !== 'All') {
      filter.hiringSeason = season;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    let drives = await RecruitmentDrive.find(filter)
      .populate('company')
      .populate('eligibleDepartments')
      .sort({ startDate: 1 });

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      drives = drives.filter(
        (d) =>
          d.jobRole.toLowerCase().includes(term) ||
          (d.company && d.company.name.toLowerCase().includes(term)) ||
          d.requiredSkills.some((s) => s.toLowerCase().includes(term))
      );
    }

    res.render('student/drives', {
      title: 'Seasonal Recruitment Drives | CRP',
      drives,
      student,
      selectedSeason: season || 'All',
      selectedStatus: status || 'All',
      searchQuery: search || '',
    });
  } catch (err) {
    console.error('Error loading drives:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * View Skill Roadmaps & Interview Preparation Tips
 */
exports.getRoadmaps = async (req, res) => {
  try {
    res.render('student/roadmaps', {
      title: 'Interview Preparation & Skill Roadmaps | CRP',
    });
  } catch (err) {
    console.error('Error loading roadmaps:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};
