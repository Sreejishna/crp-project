const HistoricalRecruitment = require('../models/HistoricalRecruitment');
const Company = require('../models/Company');
const {
  analyzeCompanyPatterns,
  generateCollegeCyclicCalendar,
  MONTH_NAMES,
} = require('../utils/cyclicPatternAnalyzer');

// @desc    Get historical recruitment records and cyclic pattern for a company
// @route   GET /api/historical/company/:companyId
// @access  Public / Authenticated
const getCompanyHistoricalAnalysis = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const analysis = await analyzeCompanyPatterns(companyId);

    return res.status(200).json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        logo: company.logo,
        industry: company.industry,
        tier: company.tier,
      },
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get college-wide cyclic recruitment calendar (Monthly + Quarterly)
// @route   GET /api/historical/calendar
// @access  Public / Authenticated
const getCyclicCalendar = async (req, res, next) => {
  try {
    const calendar = await generateCollegeCyclicCalendar();
    return res.status(200).json({
      success: true,
      data: calendar,
      months: MONTH_NAMES,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all historical records (Admin view with filters)
// @route   GET /api/historical
// @access  Private (Admin / Coordinator)
const getAllHistoricalRecords = async (req, res, next) => {
  try {
    const { companyId, year, month, quarter } = req.query;
    const filter = {};

    if (companyId) filter.company = companyId;
    if (year) filter.recruitmentYear = Number(year);
    if (month && month !== 'All') filter.hiringMonth = month;
    if (quarter && quarter !== 'All') filter.seasonQuarter = quarter;

    const records = await HistoricalRecruitment.find(filter)
      .populate('company', 'name logo industry tier')
      .sort({ recruitmentYear: -1, hiringMonthNumber: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new historical recruitment record
// @route   POST /api/historical
// @access  Private (Admin)
const createHistoricalRecord = async (req, res, next) => {
  try {
    const {
      company,
      academicYear,
      recruitmentYear,
      hiringMonth,
      recruitmentDate,
      jobRolesOffered,
      salaryPackage,
      stipendMonthly,
      studentsSelected,
      totalApplicants,
      minCgpaRequired,
      maxArrearsAllowed,
      allowedDegrees,
      selectionRounds,
      notes,
    } = req.body;

    if (!company || !academicYear || !recruitmentYear || !hiringMonth) {
      return res.status(400).json({
        success: false,
        message: 'Company, Academic Year, Calendar Year, and Hiring Month are required.',
      });
    }

    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({ success: false, message: 'Referenced Company not found.' });
    }

    const newRecord = await HistoricalRecruitment.create({
      company,
      companyName: companyDoc.name,
      academicYear,
      recruitmentYear: Number(recruitmentYear),
      hiringMonth,
      recruitmentDate: recruitmentDate || null,
      jobRolesOffered: Array.isArray(jobRolesOffered)
        ? jobRolesOffered
        : (jobRolesOffered || 'Software Engineer').split(',').map((s) => s.trim()).filter(Boolean),
      salaryPackage: salaryPackage || '5 - 8 LPA',
      stipendMonthly: Number(stipendMonthly) || 0,
      studentsSelected: Number(studentsSelected) || 0,
      totalApplicants: Number(totalApplicants) || 0,
      minCgpaRequired: Number(minCgpaRequired) || 6.5,
      maxArrearsAllowed: Number(maxArrearsAllowed) || 0,
      allowedDegrees: Array.isArray(allowedDegrees)
        ? allowedDegrees
        : (allowedDegrees || 'MCA, B.Tech CSE').split(',').map((s) => s.trim()).filter(Boolean),
      selectionRounds: Array.isArray(selectionRounds)
        ? selectionRounds
        : (selectionRounds || 'Aptitude, Technical, HR').split(',').map((s) => s.trim()).filter(Boolean),
      notes: notes || '',
    });

    // Automatically update company's cyclic pattern cache
    const updatedAnalysis = await analyzeCompanyPatterns(company);
    await Company.findByIdAndUpdate(company, {
      'cyclicPattern.topHiringMonth': updatedAnalysis.topHiringMonth,
      'cyclicPattern.recurringQuarter': updatedAnalysis.topSeasonQuarter,
      'cyclicPattern.observedPattern': updatedAnalysis.observedPattern,
      'cyclicPattern.consistencyRate': updatedAnalysis.consistencyRate,
      'cyclicPattern.scheduleType': updatedAnalysis.scheduleType,
    });

    return res.status(201).json({
      success: true,
      message: 'Historical recruitment record added and predictions updated successfully!',
      data: newRecord,
      updatedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update historical recruitment record
// @route   PUT /api/historical/:id
// @access  Private (Admin)
const updateHistoricalRecord = async (req, res, next) => {
  try {
    let record = await HistoricalRecruitment.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (req.body.jobRolesOffered && typeof req.body.jobRolesOffered === 'string') {
      req.body.jobRolesOffered = req.body.jobRolesOffered.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (req.body.selectionRounds && typeof req.body.selectionRounds === 'string') {
      req.body.selectionRounds = req.body.selectionRounds.split(',').map((s) => s.trim()).filter(Boolean);
    }

    record = await HistoricalRecruitment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Recalculate company cyclic patterns
    const updatedAnalysis = await analyzeCompanyPatterns(record.company);
    await Company.findByIdAndUpdate(record.company, {
      'cyclicPattern.topHiringMonth': updatedAnalysis.topHiringMonth,
      'cyclicPattern.recurringQuarter': updatedAnalysis.topSeasonQuarter,
      'cyclicPattern.observedPattern': updatedAnalysis.observedPattern,
      'cyclicPattern.consistencyRate': updatedAnalysis.consistencyRate,
      'cyclicPattern.scheduleType': updatedAnalysis.scheduleType,
    });

    return res.status(200).json({
      success: true,
      message: 'Historical recruitment record updated successfully!',
      data: record,
      updatedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete historical recruitment record
// @route   DELETE /api/historical/:id
// @access  Private (Admin)
const deleteHistoricalRecord = async (req, res, next) => {
  try {
    const record = await HistoricalRecruitment.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const companyId = record.company;
    await record.deleteOne();

    // Recalculate company cyclic patterns
    const updatedAnalysis = await analyzeCompanyPatterns(companyId);
    await Company.findByIdAndUpdate(companyId, {
      'cyclicPattern.topHiringMonth': updatedAnalysis.topHiringMonth || 'September',
      'cyclicPattern.recurringQuarter': updatedAnalysis.topSeasonQuarter || 'Q3',
      'cyclicPattern.observedPattern': updatedAnalysis.observedPattern || '',
      'cyclicPattern.consistencyRate': updatedAnalysis.consistencyRate || 0,
      'cyclicPattern.scheduleType': updatedAnalysis.scheduleType || 'Estimated',
    });

    return res.status(200).json({
      success: true,
      message: 'Record deleted and cyclic patterns refreshed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary of recurring recruitment patterns across all companies
// @route   GET /api/historical/patterns-summary
// @access  Public / Authenticated
const getPatternsSummary = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    const summaries = [];

    for (const comp of companies) {
      const analysis = await analyzeCompanyPatterns(comp._id);
      summaries.push({
        companyId: comp._id,
        name: comp.name,
        logo: comp.logo,
        industry: comp.industry,
        tier: comp.tier,
        recurringMonth: analysis.topHiringMonth || 'September',
        recurringQuarter: analysis.topSeasonQuarter || 'Q3',
        consistencyRate: analysis.consistencyRate,
        confidenceLevel: analysis.confidenceLevel,
        observedPattern: analysis.observedPattern,
        scheduleType: analysis.scheduleType,
        expectedNextPeriod: analysis.expectedNextPeriod,
        totalHistoricalVisits: analysis.totalVisits,
        salaryRange: comp.salaryRange,
      });
    }

    return res.status(200).json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanyHistoricalAnalysis,
  getCyclicCalendar,
  getAllHistoricalRecords,
  createHistoricalRecord,
  updateHistoricalRecord,
  deleteHistoricalRecord,
  getPatternsSummary,
};
