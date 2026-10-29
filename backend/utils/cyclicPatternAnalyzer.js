const HistoricalRecruitment = require('../models/HistoricalRecruitment');
const RecruitmentDrive = require('../models/RecruitmentDrive');

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Analyzes historical recruitment records for a given company and generates
 * recurring hiring patterns, cyclic predictions, and confirmation status.
 */
const analyzeCompanyPatterns = async (companyId) => {
  const history = await HistoricalRecruitment.find({ company: companyId }).sort({
    recruitmentYear: 1,
    hiringMonthNumber: 1,
  });

  if (!history || history.length === 0) {
    return {
      hasHistoricalData: false,
      totalVisits: 0,
      predictedMonth: null,
      predictedQuarter: null,
      confidenceScore: 0,
      confidenceLevel: 'No Historical Data',
      observedPattern: 'No historical recruitment records available for this company yet.',
      expectedNextPeriod: 'To Be Announced',
      scheduleType: 'Estimated',
      historyRecords: [],
    };
  }

  // Calculate month frequency
  const monthFreq = {};
  const quarterFreq = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  let totalCgpa = 0;
  let totalSelected = 0;

  history.forEach((rec) => {
    monthFreq[rec.hiringMonth] = (monthFreq[rec.hiringMonth] || 0) + 1;
    if (rec.seasonQuarter && quarterFreq[rec.seasonQuarter] !== undefined) {
      quarterFreq[rec.seasonQuarter] += 1;
    }
    totalCgpa += rec.minCgpaRequired || 6.5;
    totalSelected += rec.studentsSelected || 0;
  });

  // Find most frequent month (mode)
  let topMonth = null;
  let maxMonthCount = 0;
  for (const [m, count] of Object.entries(monthFreq)) {
    if (count > maxMonthCount) {
      maxMonthCount = count;
      topMonth = m;
    }
  }

  // Find most frequent quarter
  let topQuarter = 'Q3';
  let maxQuarterCount = 0;
  for (const [q, count] of Object.entries(quarterFreq)) {
    if (count > maxQuarterCount) {
      maxQuarterCount = count;
      topQuarter = q;
    }
  }

  const totalVisits = history.length;
  const consistencyRate = Math.round((maxMonthCount / totalVisits) * 100);

  let confidenceLevel = 'Medium';
  if (totalVisits >= 3 && consistencyRate >= 70) {
    confidenceLevel = 'High (Consistent Pattern)';
  } else if (totalVisits >= 2) {
    confidenceLevel = 'Moderate (Recurring)';
  } else {
    confidenceLevel = 'Emerging (Initial Record)';
  }

  const yearsRecorded = history.map((h) => `${h.recruitmentYear} (${h.hiringMonth.substring(0, 3)})`).join(', ');

  const observedPattern = `${totalVisits} campus hiring cycles recorded: ${yearsRecorded}. Primary recruitment window is repeatedly in ${topMonth} (${topQuarter} cycle).`;

  // Check if there is an officially announced active/upcoming drive
  const now = new Date();
  const officialDrive = await RecruitmentDrive.findOne({
    company: companyId,
    driveEndDate: { $gte: now },
    status: { $in: ['Upcoming', 'Active / In Progress'] },
  }).sort({ driveStartDate: 1 });

  let scheduleType = 'Estimated';
  let expectedNextPeriod = `Expected: ${topMonth} (Estimated from past ${totalVisits} years)`;
  let officialDriveDetails = null;

  if (officialDrive) {
    scheduleType = 'Confirmed';
    expectedNextPeriod = `Confirmed: ${officialDrive.driveStartDate ? new Date(officialDrive.driveStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : topMonth}`;
    officialDriveDetails = {
      id: officialDrive._id,
      title: officialDrive.driveTitle,
      startDate: officialDrive.driveStartDate,
      endDate: officialDrive.driveEndDate,
      mode: officialDrive.recruitmentMode,
      minCgpa: officialDrive.minCgpa,
      maxBacklogs: officialDrive.maxBacklogsAllowed,
      salaryRange: officialDrive.salaryRange,
    };
  }

  return {
    hasHistoricalData: true,
    totalVisits,
    topHiringMonth: topMonth,
    topSeasonQuarter: topQuarter,
    consistencyRate,
    confidenceLevel,
    observedPattern,
    expectedNextPeriod,
    scheduleType, // 'Confirmed' or 'Estimated'
    isEstimated: scheduleType === 'Estimated',
    isConfirmed: scheduleType === 'Confirmed',
    averageMinCgpa: (totalCgpa / totalVisits).toFixed(2),
    totalStudentsPlacedHistorically: totalSelected,
    officialDrive: officialDriveDetails,
    historyRecords: history,
  };
};

/**
 * Generates college-wide cyclic calendar for all 12 months combining
 * both confirmed scheduled drives and estimated recurring patterns.
 */
const generateCollegeCyclicCalendar = async () => {
  const Company = require('../models/Company');
  const companies = await Company.find().sort({ name: 1 });

  const calendarByMonth = {};
  MONTH_NAMES.forEach((m, idx) => {
    calendarByMonth[m] = {
      monthName: m,
      monthNumber: idx + 1,
      quarter: idx + 1 <= 3 ? 'Q1' : idx + 1 <= 6 ? 'Q2' : idx + 1 <= 9 ? 'Q3' : 'Q4',
      companies: [],
    };
  });

  for (const company of companies) {
    const analysis = await analyzeCompanyPatterns(company._id);
    const targetMonth = analysis.topHiringMonth || 'September';

    if (calendarByMonth[targetMonth]) {
      calendarByMonth[targetMonth].companies.push({
        id: company._id,
        name: company.name,
        logo: company.logo,
        industry: company.industry,
        tier: company.tier,
        salaryRange: company.salaryRange,
        minCgpa: company.eligibilityCriteria?.minCgpa || 6.5,
        maxBacklogs: company.eligibilityCriteria?.maxBacklogs || 0,
        allowedAcademicYears: company.allowedAcademicYears || [3, 4],
        allowedDegrees: company.requiredQualifications || ['MCA', 'B.Tech CSE'],
        scheduleType: analysis.scheduleType, // 'Confirmed' | 'Estimated'
        isConfirmed: analysis.isConfirmed,
        confidenceLevel: analysis.confidenceLevel,
        observedPattern: analysis.observedPattern,
        expectedPeriod: analysis.expectedNextPeriod,
        totalHistoricalVisits: analysis.totalVisits,
      });
    }
  }

  return calendarByMonth;
};

module.exports = {
  analyzeCompanyPatterns,
  generateCollegeCyclicCalendar,
  MONTH_NAMES,
};
