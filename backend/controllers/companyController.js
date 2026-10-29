const Company = require('../models/Company');
const JobRole = require('../models/JobRole');
const RecruitmentDrive = require('../models/RecruitmentDrive');

// @desc    Get all companies with search, filter, and seasonal categorization
// @route   GET /api/companies
// @access  Public / Authenticated
const getCompanies = async (req, res, next) => {
  try {
    const {
      search,
      season,
      quarter,
      status,
      industry,
      tier,
      department,
      qualification,
      skill,
      workMode,
      featured,
    } = req.query;

    const query = {};

    // Text search on name, industry, description, or headquarters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { defaultLocation: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by hiring season
    if (season && season !== 'All') {
      query.hiringSeason = { $regex: season, $options: 'i' };
    }

    // Filter by season quarter (Q1, Q2, Q3, Q4)
    if (quarter && quarter !== 'All') {
      query.seasonQuarter = quarter;
    }

    // Filter by recruitment status
    if (status && status !== 'All') {
      query.recruitmentStatus = status;
    }

    // Filter by industry
    if (industry && industry !== 'All') {
      query.industry = { $regex: industry, $options: 'i' };
    }

    // Filter by tier
    if (tier && tier !== 'All') {
      query.tier = tier;
    }

    // Filter by work mode
    if (workMode && workMode !== 'All') {
      query.defaultWorkMode = workMode;
    }

    // Filter by qualification
    if (qualification && qualification !== 'All') {
      query.requiredQualifications = { $in: [new RegExp(qualification, 'i')] };
    }

    // Filter by skill
    if (skill && skill !== 'All') {
      query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    // Filter by department (checks eligibility criteria eligibleDepartments)
    if (department && department !== 'All') {
      query['eligibilityCriteria.eligibleDepartments'] = department;
    }

    // Filter featured
    if (featured === 'true') {
      query.featured = true;
    }

    const companies = await Company.find(query)
      .populate('eligibilityCriteria.eligibleDepartments', 'name code')
      .sort({ featured: -1, recruitmentStartDate: 1, createdAt: -1 });

    // Fetch job roles associated with each company
    const companyIds = companies.map((c) => c._id);
    const jobRoles = await JobRole.find({ company: { $in: companyIds } });

    // Attach job roles to company objects
    const formattedCompanies = companies.map((comp) => {
      const roles = jobRoles.filter((jr) => jr.company.toString() === comp._id.toString());
      return {
        ...comp.toObject(),
        jobRoles: roles,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedCompanies.length,
      data: formattedCompanies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company details with job roles, active drives, and interview rounds
// @route   GET /api/companies/:id
// @access  Public / Authenticated
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      'eligibilityCriteria.eligibleDepartments',
      'name code hodName'
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found with specified ID',
      });
    }

    const jobRoles = await JobRole.find({ company: company._id });
    const drives = await RecruitmentDrive.find({ company: company._id })
      .populate('eligibleDepartments', 'name code')
      .populate('jobRoles')
      .sort({ driveStartDate: 1 });

    return res.status(200).json({
      success: true,
      data: {
        ...company.toObject(),
        jobRoles,
        recruitmentDrives: drives,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company (Admin only)
// @route   POST /api/companies
// @access  Private (Admin)
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      logo,
      website,
      industry,
      tier,
      hiringSeason,
      seasonQuarter,
      recruitmentType,
      description,
      headquarters,
      contactEmail,
      contactPerson,
      recruitmentStartDate,
      recruitmentEndDate,
      recruitmentStatus,
      defaultLocation,
      defaultWorkMode,
      salaryRange,
      stipendMonthly,
      vacancies,
      experienceRequirement,
      requiredQualifications,
      requiredSkills,
      eligibilityCriteria,
      interviewRounds,
      preparationTips,
      learningRoadmap,
      featured,
      jobRolesList, // Optional array of job roles to auto-create
    } = req.body;

    const parsedSkills = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedQualifications = Array.isArray(requiredQualifications)
      ? requiredQualifications
      : typeof requiredQualifications === 'string'
      ? requiredQualifications.split(',').map((q) => q.trim()).filter(Boolean)
      : ['MCA', 'B.Tech CSE', 'B.Tech ISE'];

    const parsedTips = Array.isArray(preparationTips)
      ? preparationTips
      : typeof preparationTips === 'string'
      ? preparationTips.split('\n').map((t) => t.trim()).filter(Boolean)
      : [];

    const company = await Company.create({
      name,
      logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128`,
      website,
      industry,
      tier: tier || 'Dream (8-15 LPA)',
      hiringSeason: hiringSeason || 'July - September Hiring',
      seasonQuarter: seasonQuarter || 'Q3',
      recruitmentType: recruitmentType || 'Seasonal Mega Drive',
      description,
      headquarters: headquarters || 'Bengaluru, India',
      contactEmail,
      contactPerson,
      recruitmentStartDate: recruitmentStartDate ? new Date(recruitmentStartDate) : null,
      recruitmentEndDate: recruitmentEndDate ? new Date(recruitmentEndDate) : null,
      recruitmentStatus: recruitmentStatus || 'Upcoming',
      defaultLocation: defaultLocation || 'Pan India',
      defaultWorkMode: defaultWorkMode || 'Hybrid',
      salaryRange: salaryRange || '8 - 14 LPA',
      stipendMonthly: Number(stipendMonthly) || 35000,
      vacancies: Number(vacancies) || 20,
      experienceRequirement: experienceRequirement || 'Freshers (2025 / 2026 Batch)',
      requiredQualifications: parsedQualifications,
      requiredSkills: parsedSkills,
      eligibilityCriteria: eligibilityCriteria || {
        minCgpa: 7.0,
        minTenth: 60,
        minTwelfth: 60,
        maxBacklogs: 0,
        allowedBatches: [2025, 2026],
      },
      interviewRounds: interviewRounds || [
        { roundNumber: 1, name: 'Online Aptitude & Coding Test', mode: 'Online', duration: '90 mins', description: 'MCQs on DSA, CS Fundamentals, and 2 Coding Questions' },
        { roundNumber: 2, name: 'Technical Interview 1', mode: 'Online', duration: '45 mins', description: 'DSA, Project discussion, Live coding' },
        { roundNumber: 3, name: 'Technical Interview 2 / System Design', mode: 'Online', duration: '45 mins', description: 'System design basics, Database design, Core CS concepts' },
        { roundNumber: 4, name: 'HR & Managerial Discussion', mode: 'Online', duration: '30 mins', description: 'Cultural fit, behavioral questions, salary & location preference' },
      ],
      preparationTips: parsedTips,
      learningRoadmap: learningRoadmap || '',
      featured: featured || false,
    });

    // If jobRolesList passed, create them
    if (Array.isArray(jobRolesList) && jobRolesList.length > 0) {
      for (const roleData of jobRolesList) {
        await JobRole.create({
          ...roleData,
          company: company._id,
          hiringSeason: company.hiringSeason,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Company '${company.name}' created successfully with recruitment details.`,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company (Admin only)
// @route   PUT /api/companies/:id
// @access  Private (Admin)
const updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // If requiredSkills or requiredQualifications is passed as string, format
    if (typeof req.body.requiredSkills === 'string') {
      req.body.requiredSkills = req.body.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (typeof req.body.requiredQualifications === 'string') {
      req.body.requiredQualifications = req.body.requiredQualifications.split(',').map((q) => q.trim()).filter(Boolean);
    }
    if (typeof req.body.preparationTips === 'string') {
      req.body.preparationTips = req.body.preparationTips.split('\n').map((t) => t.trim()).filter(Boolean);
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('eligibilityCriteria.eligibleDepartments', 'name code');

    return res.status(200).json({
      success: true,
      message: `Company '${company.name}' updated successfully!`,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company (Admin only)
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Cascade delete associated job roles & drives
    await JobRole.deleteMany({ company: company._id });
    await RecruitmentDrive.deleteMany({ company: company._id });
    await company.deleteOne();

    return res.status(200).json({
      success: true,
      message: `Company '${company.name}' and associated recruitment records deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Seasonal Overview & Breakdown
// @route   GET /api/companies/seasonal-overview
// @access  Public
const getSeasonalOverview = async (req, res, next) => {
  try {
    const seasons = [
      {
        seasonKey: 'Q1',
        name: 'January – March Hiring',
        focus: 'Spring Internships, Early Full-Time Conversion & Product Startups',
        months: 'Jan, Feb, Mar',
        color: '#3B82F6',
      },
      {
        seasonKey: 'Q2',
        name: 'April – June Hiring',
        focus: 'Summer Placement Drives, Tech Research & Consulting Hiring',
        months: 'Apr, May, Jun',
        color: '#10B981',
      },
      {
        seasonKey: 'Q3',
        name: 'July – September Hiring',
        focus: 'Autumn Mega Campus Season, Super Dream & Day-1 Tech Giants',
        months: 'Jul, Aug, Sep',
        color: '#8B5CF6',
      },
      {
        seasonKey: 'Q4',
        name: 'October – December Hiring',
        focus: 'Winter Dream Drives, Core Engineering, Fintech & Pool Drives',
        months: 'Oct, Nov, Dec',
        color: '#F59E0B',
      },
    ];

    const results = await Promise.all(
      seasons.map(async (season) => {
        const companies = await Company.find({
          hiringSeason: { $regex: season.name.split(' ')[0], $options: 'i' },
        }).sort({ recruitmentStartDate: 1 });

        const activeDrives = await RecruitmentDrive.find({
          hiringSeason: { $regex: season.name.split(' ')[0], $options: 'i' },
        }).populate('company', 'name logo tier');

        return {
          ...season,
          totalCompanies: companies.length,
          totalDrives: activeDrives.length,
          companies,
          activeDrives,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getSeasonalOverview,
};
