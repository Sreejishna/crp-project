const mongoose = require('mongoose');

const historicalRecruitmentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    companyName: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g., 2023-2024)'],
      trim: true,
    },
    recruitmentYear: {
      type: Number,
      required: [true, 'Calendar year is required'],
    },
    hiringMonth: {
      type: String,
      required: [true, 'Hiring month is required'],
      enum: [
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
      ],
    },
    hiringMonthNumber: {
      type: Number,
      min: 1,
      max: 12,
    },
    seasonQuarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4'],
      default: 'Q3',
    },
    recruitmentDate: {
      type: Date,
    },
    jobRolesOffered: {
      type: [String],
      default: ['Software Engineer', 'Associate Developer'],
    },
    salaryPackage: {
      type: String,
      default: '4.5 - 7.0 LPA',
    },
    stipendMonthly: {
      type: Number,
      default: 0,
    },
    studentsSelected: {
      type: Number,
      default: 0,
    },
    totalApplicants: {
      type: Number,
      default: 0,
    },
    minCgpaRequired: {
      type: Number,
      default: 6.5,
    },
    maxArrearsAllowed: {
      type: Number,
      default: 0,
    },
    allowedDegrees: {
      type: [String],
      default: ['MCA', 'B.Tech CSE', 'B.Tech ISE', 'B.Tech ECE'],
    },
    selectionRounds: {
      type: [String],
      default: [
        'Online Aptitude & Coding Assessment',
        'Technical Interview',
        'HR & Cultural Fit Round',
      ],
    },
    scheduleType: {
      type: String,
      enum: ['Confirmed', 'Estimated'],
      default: 'Confirmed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-derive month number and quarter before saving
historicalRecruitmentSchema.pre('save', function (next) {
  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  if (this.hiringMonth) {
    this.hiringMonthNumber = monthMap[this.hiringMonth] || 1;
    if (this.hiringMonthNumber <= 3) this.seasonQuarter = 'Q1';
    else if (this.hiringMonthNumber <= 6) this.seasonQuarter = 'Q2';
    else if (this.hiringMonthNumber <= 9) this.seasonQuarter = 'Q3';
    else this.seasonQuarter = 'Q4';
  }
  next();
});

module.exports = mongoose.model('HistoricalRecruitment', historicalRecruitmentSchema);
