const Company = require('../models/Company');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Announcement = require('../models/Announcement');
const PlacementRecord = require('../models/PlacementRecord');
const User = require('../models/User');

/**
 * Admin Dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const activeDrives = await RecruitmentDrive.countDocuments({ status: 'Active' });
    const upcomingDrives = await RecruitmentDrive.countDocuments({ status: 'Upcoming' });
    const totalPlacements = await PlacementRecord.countDocuments();

    const recentDrives = await RecruitmentDrive.find()
      .populate('company')
      .populate('eligibleDepartments')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAnnouncements = await Announcement.find()
      .populate('department')
      .sort({ date: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Central Admin Dashboard | Cyclic Recruitment Portal',
      totalCompanies,
      totalStudents,
      totalDepartments,
      activeDrives,
      upcomingDrives,
      totalPlacements,
      recentDrives,
      recentAnnouncements,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/* ==========================================================
   COMPANY MANAGEMENT (CRUD)
   ========================================================== */
exports.getCompanies = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { industry: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const companies = await Company.find(query).sort({ name: 1 });
    res.render('admin/companies', {
      title: 'Company Management | Admin',
      companies,
      searchQuery: search || '',
    });
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.getNewCompany = (req, res) => {
  res.render('admin/company-form', {
    title: 'Add New Company | Admin',
    company: null,
    isEdit: false,
  });
};

exports.postNewCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      tier,
      description,
      website,
      logo,
      headquarters,
      contactEmail,
      contactPerson,
    } = req.body;

    if (!name || !industry || !description) {
      req.flash('error_msg', 'Company Name, Industry, and Description are required.');
      return res.redirect('/admin/companies/new');
    }

    const company = new Company({
      name: name.trim(),
      industry: industry.trim(),
      tier: tier || 'Dream (8-15 LPA)',
      description: description.trim(),
      website: website || 'https://example.com',
      logo: logo || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&auto=format&fit=crop&q=80',
      headquarters: headquarters || 'Bengaluru',
      contactEmail: contactEmail || 'campus@example.com',
      contactPerson: contactPerson || 'Campus Recruitment Lead',
    });

    await company.save();
    req.flash('success_msg', `Company "${company.name}" created successfully!`);
    res.redirect('/admin/companies');
  } catch (err) {
    console.error('Error creating company:', err);
    req.flash('error_msg', 'Failed to add company: ' + err.message);
    res.redirect('/admin/companies/new');
  }
};

exports.getEditCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      req.flash('error_msg', 'Company not found.');
      return res.redirect('/admin/companies');
    }
    res.render('admin/company-form', {
      title: `Edit ${company.name} | Admin`,
      company,
      isEdit: true,
    });
  } catch (err) {
    console.error('Error loading company edit:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postEditCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      tier,
      description,
      website,
      logo,
      headquarters,
      contactEmail,
      contactPerson,
    } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      req.flash('error_msg', 'Company not found.');
      return res.redirect('/admin/companies');
    }

    company.name = name ? name.trim() : company.name;
    company.industry = industry ? industry.trim() : company.industry;
    company.tier = tier || company.tier;
    company.description = description ? description.trim() : company.description;
    company.website = website || company.website;
    company.logo = logo || company.logo;
    company.headquarters = headquarters || company.headquarters;
    company.contactEmail = contactEmail || company.contactEmail;
    company.contactPerson = contactPerson || company.contactPerson;

    await company.save();
    req.flash('success_msg', `Company "${company.name}" updated successfully!`);
    res.redirect('/admin/companies');
  } catch (err) {
    console.error('Error updating company:', err);
    req.flash('error_msg', 'Failed to update company: ' + err.message);
    res.redirect(`/admin/companies/${req.params.id}/edit`);
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (company) {
      await RecruitmentDrive.deleteMany({ company: company._id });
      await PlacementRecord.deleteMany({ company: company._id });
      await Company.findByIdAndDelete(company._id);
      req.flash('success_msg', `Company "${company.name}" and associated drives were deleted.`);
    }
    res.redirect('/admin/companies');
  } catch (err) {
    console.error('Error deleting company:', err);
    req.flash('error_msg', 'Error deleting company: ' + err.message);
    res.redirect('/admin/companies');
  }
};

/* ==========================================================
   RECRUITMENT DRIVES MANAGEMENT (CRUD)
   ========================================================== */
exports.getDrives = async (req, res) => {
  try {
    const { season, status } = req.query;
    const filter = {};
    if (season && season !== 'All') filter.hiringSeason = season;
    if (status && status !== 'All') filter.status = status;

    const drives = await RecruitmentDrive.find(filter)
      .populate('company')
      .populate('eligibleDepartments')
      .sort({ startDate: 1 });

    res.render('admin/drives', {
      title: 'Recruitment Drives Management | Admin',
      drives,
      selectedSeason: season || 'All',
      selectedStatus: status || 'All',
    });
  } catch (err) {
    console.error('Error fetching drives:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.getNewDrive = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    const departments = await Department.find().sort({ code: 1 });
    res.render('admin/drive-form', {
      title: 'Schedule Seasonal Recruitment Drive | Admin',
      drive: null,
      companies,
      departments,
      isEdit: false,
    });
  } catch (err) {
    console.error('Error loading new drive form:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postNewDrive = async (req, res) => {
  try {
    const {
      company,
      jobRole,
      hiringSeason,
      startDate,
      endDate,
      eligibleDepartments,
      minCgpa,
      maxBacklogs,
      qualification,
      requiredSkills,
      vacancies,
      salary,
      workLocation,
      workMode,
      round1_name,
      round1_mode,
      round1_desc,
      round2_name,
      round2_mode,
      round2_desc,
      round3_name,
      round3_mode,
      round3_desc,
      status,
    } = req.body;

    const interviewRounds = [];
    if (round1_name) {
      interviewRounds.push({
        roundNumber: 1,
        name: round1_name,
        mode: round1_mode || 'Online',
        description: round1_desc || '',
      });
    }
    if (round2_name) {
      interviewRounds.push({
        roundNumber: 2,
        name: round2_name,
        mode: round2_mode || 'Online',
        description: round2_desc || '',
      });
    }
    if (round3_name) {
      interviewRounds.push({
        roundNumber: 3,
        name: round3_name,
        mode: round3_mode || 'Online',
        description: round3_desc || '',
      });
    }

    const deptArray = Array.isArray(eligibleDepartments)
      ? eligibleDepartments
      : eligibleDepartments
      ? [eligibleDepartments]
      : [];

    const skillsArray = requiredSkills
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Data Structures', 'Java', 'SQL'];

    const drive = new RecruitmentDrive({
      company,
      jobRole: jobRole.trim(),
      hiringSeason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      eligibleDepartments: deptArray,
      minCgpa: minCgpa ? parseFloat(minCgpa) : 6.0,
      maxBacklogs: maxBacklogs ? parseInt(maxBacklogs) : 0,
      qualification: qualification || 'MCA, B.Tech CSE, ISE, ECE',
      requiredSkills: skillsArray,
      vacancies: vacancies ? parseInt(vacancies) : 10,
      salary: salary.trim(),
      workLocation: workLocation || 'Bengaluru / Hybrid',
      workMode: workMode || 'Hybrid',
      interviewRounds,
      status: status || 'Upcoming',
    });

    await drive.save();
    req.flash('success_msg', 'Seasonal Recruitment Drive scheduled successfully!');
    res.redirect('/admin/drives');
  } catch (err) {
    console.error('Error creating drive:', err);
    req.flash('error_msg', 'Failed to schedule drive: ' + err.message);
    res.redirect('/admin/drives/new');
  }
};

exports.getEditDrive = async (req, res) => {
  try {
    const drive = await RecruitmentDrive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Drive not found.');
      return res.redirect('/admin/drives');
    }
    const companies = await Company.find().sort({ name: 1 });
    const departments = await Department.find().sort({ code: 1 });

    res.render('admin/drive-form', {
      title: 'Edit Recruitment Drive | Admin',
      drive,
      companies,
      departments,
      isEdit: true,
    });
  } catch (err) {
    console.error('Error loading edit drive form:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postEditDrive = async (req, res) => {
  try {
    const {
      company,
      jobRole,
      hiringSeason,
      startDate,
      endDate,
      eligibleDepartments,
      minCgpa,
      maxBacklogs,
      qualification,
      requiredSkills,
      vacancies,
      salary,
      workLocation,
      workMode,
      status,
    } = req.body;

    const drive = await RecruitmentDrive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Drive not found.');
      return res.redirect('/admin/drives');
    }

    const deptArray = Array.isArray(eligibleDepartments)
      ? eligibleDepartments
      : eligibleDepartments
      ? [eligibleDepartments]
      : [];

    const skillsArray = requiredSkills
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : drive.requiredSkills;

    drive.company = company || drive.company;
    drive.jobRole = jobRole || drive.jobRole;
    drive.hiringSeason = hiringSeason || drive.hiringSeason;
    if (startDate) drive.startDate = new Date(startDate);
    if (endDate) drive.endDate = new Date(endDate);
    drive.eligibleDepartments = deptArray;
    if (minCgpa) drive.minCgpa = parseFloat(minCgpa);
    if (maxBacklogs !== undefined) drive.maxBacklogs = parseInt(maxBacklogs);
    drive.qualification = qualification || drive.qualification;
    drive.requiredSkills = skillsArray;
    if (vacancies) drive.vacancies = parseInt(vacancies);
    drive.salary = salary || drive.salary;
    drive.workLocation = workLocation || drive.workLocation;
    drive.workMode = workMode || drive.workMode;
    drive.status = status || drive.status;

    await drive.save();
    req.flash('success_msg', 'Recruitment Drive updated successfully!');
    res.redirect('/admin/drives');
  } catch (err) {
    console.error('Error updating drive:', err);
    req.flash('error_msg', 'Failed to update drive: ' + err.message);
    res.redirect(`/admin/drives/${req.params.id}/edit`);
  }
};

exports.deleteDrive = async (req, res) => {
  try {
    await RecruitmentDrive.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Recruitment Drive removed successfully.');
    res.redirect('/admin/drives');
  } catch (err) {
    console.error('Error deleting drive:', err);
    req.flash('error_msg', 'Error deleting drive: ' + err.message);
    res.redirect('/admin/drives');
  }
};

/* ==========================================================
   STUDENT RECORDS MANAGEMENT (CRUD)
   ========================================================== */
exports.getStudents = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const filter = {};
    if (department && department !== 'All') filter.department = department;
    if (status && status !== 'All') filter.placementStatus = status;

    let students = await Student.find(filter)
      .populate('department')
      .sort({ studentId: 1 });

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.studentId.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
      );
    }

    const departments = await Department.find().sort({ code: 1 });

    res.render('admin/students', {
      title: 'Student Records Management | Admin',
      students,
      departments,
      selectedDepartment: department || 'All',
      selectedStatus: status || 'All',
      searchQuery: search || '',
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.getNewStudent = async (req, res) => {
  try {
    const departments = await Department.find().sort({ code: 1 });
    res.render('admin/student-form', {
      title: 'Add New Student Record | Admin',
      student: null,
      departments,
      isEdit: false,
    });
  } catch (err) {
    console.error('Error loading new student form:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postNewStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      department,
      qualification,
      batch,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      skills,
      phone,
      placementStatus,
    } = req.body;

    const departments = await Department.find().sort({ code: 1 });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error_msg', 'Email already registered.');
      return res.render('admin/student-form', {
        title: 'Add New Student Record',
        student: req.body,
        departments,
        isEdit: false,
      });
    }

    const skillsArray = skills
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Java', 'SQL'];

    // Create user account with default password student123
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: 'student123',
      role: 'student',
      department,
    });
    await user.save();

    const student = new Student({
      user: user._id,
      studentId: studentId.toUpperCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department,
      qualification: qualification || 'MCA',
      batch: batch ? parseInt(batch) : 2026,
      cgpa: cgpa ? parseFloat(cgpa) : 7.0,
      tenthPercentage: tenthPercentage ? parseFloat(tenthPercentage) : 70,
      twelfthPercentage: twelfthPercentage ? parseFloat(twelfthPercentage) : 70,
      activeBacklogs: activeBacklogs ? parseInt(activeBacklogs) : 0,
      skills: skillsArray,
      phone: phone || '+91 98765 00000',
      placementStatus: placementStatus || 'Not Placed',
    });
    await student.save();

    user.studentRef = student._id;
    await user.save();

    await Department.findByIdAndUpdate(department, { $inc: { totalStudents: 1 } });

    req.flash('success_msg', `Student ${student.name} (${student.studentId}) created successfully!`);
    res.redirect('/admin/students');
  } catch (err) {
    console.error('Error adding student:', err);
    req.flash('error_msg', 'Failed to add student: ' + err.message);
    res.redirect('/admin/students/new');
  }
};

exports.getEditStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('department');
    if (!student) {
      req.flash('error_msg', 'Student not found.');
      return res.redirect('/admin/students');
    }
    const departments = await Department.find().sort({ code: 1 });
    res.render('admin/student-form', {
      title: `Edit ${student.name} | Admin`,
      student,
      departments,
      isEdit: true,
    });
  } catch (err) {
    console.error('Error loading edit student form:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postEditStudent = async (req, res) => {
  try {
    const {
      name,
      studentId,
      department,
      qualification,
      batch,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      skills,
      phone,
      placementStatus,
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      req.flash('error_msg', 'Student not found.');
      return res.redirect('/admin/students');
    }

    const skillsArray = skills
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : student.skills;

    student.name = name || student.name;
    student.studentId = studentId || student.studentId;
    student.department = department || student.department;
    student.qualification = qualification || student.qualification;
    if (batch) student.batch = parseInt(batch);
    if (cgpa) student.cgpa = parseFloat(cgpa);
    if (tenthPercentage) student.tenthPercentage = parseFloat(tenthPercentage);
    if (twelfthPercentage) student.twelfthPercentage = parseFloat(twelfthPercentage);
    if (activeBacklogs !== undefined) student.activeBacklogs = parseInt(activeBacklogs);
    student.skills = skillsArray;
    student.phone = phone || student.phone;
    student.placementStatus = placementStatus || student.placementStatus;

    await student.save();
    req.flash('success_msg', `Student ${student.name} updated successfully!`);
    res.redirect('/admin/students');
  } catch (err) {
    console.error('Error updating student:', err);
    req.flash('error_msg', 'Failed to update student: ' + err.message);
    res.redirect(`/admin/students/${req.params.id}/edit`);
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      await User.findByIdAndDelete(student.user);
      await PlacementRecord.deleteMany({ student: student._id });
      await Department.findByIdAndUpdate(student.department, { $inc: { totalStudents: -1 } });
      await Student.findByIdAndDelete(student._id);
      req.flash('success_msg', 'Student record removed.');
    }
    res.redirect('/admin/students');
  } catch (err) {
    console.error('Error deleting student:', err);
    req.flash('error_msg', 'Failed to delete student: ' + err.message);
    res.redirect('/admin/students');
  }
};

/* ==========================================================
   DEPARTMENTS MANAGEMENT (CRUD)
   ========================================================== */
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ code: 1 });
    res.render('admin/departments', {
      title: 'Academic Departments Management | Admin',
      departments,
    });
  } catch (err) {
    console.error('Error loading departments:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postNewDepartment = async (req, res) => {
  try {
    const { name, code, hodName, hodEmail, hodPhone, description } = req.body;
    if (!name || !code) {
      req.flash('error_msg', 'Department Name and Code are required.');
      return res.redirect('/admin/departments');
    }

    const dept = new Department({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      hodName: hodName || 'Head of Department',
      hodEmail: hodEmail || '',
      hodPhone: hodPhone || '',
      description: description || '',
    });
    await dept.save();

    req.flash('success_msg', `Department ${dept.code} created successfully!`);
    res.redirect('/admin/departments');
  } catch (err) {
    console.error('Error creating department:', err);
    req.flash('error_msg', 'Failed to create department: ' + err.message);
    res.redirect('/admin/departments');
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Department removed.');
    res.redirect('/admin/departments');
  } catch (err) {
    console.error('Error deleting department:', err);
    req.flash('error_msg', 'Failed to delete department: ' + err.message);
    res.redirect('/admin/departments');
  }
};

/* ==========================================================
   ANNOUNCEMENTS MANAGEMENT
   ========================================================== */
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('department')
      .sort({ date: -1 });

    const departments = await Department.find().sort({ code: 1 });

    res.render('admin/announcements', {
      title: 'Announcements Broadcast | Admin',
      announcements,
      departments,
    });
  } catch (err) {
    console.error('Error loading announcements:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postNewAnnouncement = async (req, res) => {
  try {
    const { title, description, priority, department } = req.body;
    if (!title || !description) {
      req.flash('error_msg', 'Title and description are required.');
      return res.redirect('/admin/announcements');
    }

    const announcement = new Announcement({
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'Normal',
      department: department && department !== 'ALL' ? department : null,
      publishedBy: req.session.user.id,
    });
    await announcement.save();

    req.flash('success_msg', 'Announcement broadcasted successfully!');
    res.redirect('/admin/announcements');
  } catch (err) {
    console.error('Error publishing announcement:', err);
    req.flash('error_msg', 'Failed to post announcement: ' + err.message);
    res.redirect('/admin/announcements');
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Announcement deleted.');
    res.redirect('/admin/announcements');
  } catch (err) {
    console.error('Error deleting announcement:', err);
    req.flash('error_msg', 'Failed to delete announcement: ' + err.message);
    res.redirect('/admin/announcements');
  }
};

/* ==========================================================
   PLACEMENT RECORDS MANAGEMENT
   ========================================================== */
exports.getPlacements = async (req, res) => {
  try {
    const records = await PlacementRecord.find()
      .populate({
        path: 'student',
        populate: { path: 'department' },
      })
      .populate('company')
      .sort({ placedDate: -1 });

    const students = await Student.find().populate('department').sort({ name: 1 });
    const companies = await Company.find().sort({ name: 1 });

    res.render('admin/placement-records', {
      title: 'Placement Records Management | Admin',
      records,
      students,
      companies,
    });
  } catch (err) {
    console.error('Error loading placements:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

exports.postNewPlacement = async (req, res) => {
  try {
    const { student, company, jobRole, package: pkg, placementStatus } = req.body;

    if (!student || !company || !jobRole || !pkg) {
      req.flash('error_msg', 'Please select student, company, role, and package.');
      return res.redirect('/admin/placements');
    }

    const record = new PlacementRecord({
      student,
      company,
      jobRole: jobRole.trim(),
      package: pkg.trim(),
      placementStatus: placementStatus || 'Placed',
    });
    await record.save();

    // Mark student status as Placed
    await Student.findByIdAndUpdate(student, { placementStatus: 'Placed' });

    req.flash('success_msg', 'Student placement recorded successfully!');
    res.redirect('/admin/placements');
  } catch (err) {
    console.error('Error saving placement record:', err);
    req.flash('error_msg', 'Failed to save record: ' + err.message);
    res.redirect('/admin/placements');
  }
};

exports.deletePlacement = async (req, res) => {
  try {
    const record = await PlacementRecord.findById(req.params.id);
    if (record) {
      await PlacementRecord.findByIdAndDelete(record._id);
      req.flash('success_msg', 'Placement record deleted.');
    }
    res.redirect('/admin/placements');
  } catch (err) {
    console.error('Error deleting placement record:', err);
    req.flash('error_msg', 'Failed to delete record: ' + err.message);
    res.redirect('/admin/placements');
  }
};

/* ==========================================================
   REPORTS & VISUAL ANALYTICS
   ========================================================== */
exports.getReports = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ placementStatus: 'Placed' });
    const totalCompanies = await Company.countDocuments();
    const totalDrives = await RecruitmentDrive.countDocuments();

    // Department-wise distribution
    const departments = await Department.find();
    const deptStats = [];
    for (const d of departments) {
      const count = await Student.countDocuments({ department: d._id });
      const placed = await Student.countDocuments({ department: d._id, placementStatus: 'Placed' });
      deptStats.push({
        code: d.code,
        name: d.name,
        total: count,
        placed: placed,
        rate: count > 0 ? ((placed / count) * 100).toFixed(1) : 0,
      });
    }

    // Seasonal Drives count
    const q1Count = await RecruitmentDrive.countDocuments({ hiringSeason: 'January–March' });
    const q2Count = await RecruitmentDrive.countDocuments({ hiringSeason: 'April–June' });
    const q3Count = await RecruitmentDrive.countDocuments({ hiringSeason: 'July–September' });
    const q4Count = await RecruitmentDrive.countDocuments({ hiringSeason: 'October–December' });

    res.render('admin/reports', {
      title: 'Placement Reports & Analytics | Admin',
      totalStudents,
      placedStudents,
      totalCompanies,
      totalDrives,
      deptStats,
      seasonalCounts: {
        Q1: q1Count,
        Q2: q2Count,
        Q3: q3Count,
        Q4: q4Count,
      },
    });
  } catch (err) {
    console.error('Error generating reports:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};
