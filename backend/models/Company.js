const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    tier: {
      type: String,
      enum: ['Super Dream (15+ LPA)', 'Dream (8-15 LPA)', 'Tier-1 Core (5-8 LPA)', 'Mass Recruiter (3.5-5 LPA)', 'Startup / Product', 'Fintech'],
      default: 'Dream (8-15 LPA)',
    },
    hiringSeason: {
      type: String,
      required: [true, 'Hiring season is required'],
      enum: [
        'January - March Hiring',
        'April - June Hiring',
        'July - September Hiring',
        'October - December Hiring',
        'Year-Round / Regular',
      ],
      default: 'July - September Hiring',
    },
    seasonQuarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'All'],
      default: 'Q3',
    },
    recruitmentType: {
      type: String,
      enum: ['Seasonal Mega Drive', 'Seasonal Internship to FTE', 'Winter Dream Hiring', 'Regular / Annual Hiring', 'Pool Campus Drive'],
      default: 'Seasonal Mega Drive',
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
    },
    headquarters: {
      type: String,
      default: 'Bengaluru, India',
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    contactPerson: {
      type: String,
      default: '',
    },
    // General recruitment window
    recruitmentStartDate: {
      type: Date,
      default: null,
    },
    recruitmentEndDate: {
      type: Date,
      default: null,
    },
    recruitmentStatus: {
      type: String,
      enum: ['Upcoming', 'Registration Open', 'Active / In Progress', 'Completed', 'Season Ended'],
      default: 'Upcoming',
    },
    defaultLocation: {
      type: String,
      default: 'Pan India / Hybrid',
    },
    defaultWorkMode: {
      type: String,
      enum: ['Onsite', 'Remote', 'Hybrid'],
      default: 'Hybrid',
    },
    salaryRange: {
      type: String,
      default: '8 - 14 LPA',
    },
    stipendMonthly: {
      type: Number,
      default: 35000,
    },
    vacancies: {
      type: Number,
      default: 20,
    },
    experienceRequirement: {
      type: String,
      default: 'Freshers (2025 / 2026 Batch)',
    },
    requiredQualifications: {
      type: [String],
      default: ['MCA', 'B.Tech CSE', 'B.Tech ISE', 'B.Tech ECE'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    eligibilityCriteria: {
      minCgpa: { type: Number, default: 7.0 },
      minTenth: { type: Number, default: 60 },
      minTwelfth: { type: Number, default: 60 },
      maxBacklogs: { type: Number, default: 0 },
      eligibleDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
      allowedBatches: { type: [Number], default: [2025, 2026] },
    },
    interviewRounds: [
      {
        roundNumber: { type: Number, default: 1 },
        name: { type: String, required: true },
        mode: { type: String, enum: ['Online', 'Offline', 'Offline / In-Person', 'In-Person / On-Campus', 'Hybrid'], default: 'Online' },
        duration: { type: String, default: '60 mins' },
        description: { type: String, default: '' },
        tips: { type: String, default: '' },
      },
    ],
    preparationTips: {
      type: [String],
      default: [],
    },
    learningRoadmap: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    allowedAcademicYears: {
      type: [Number],
      default: [3, 4], // 3rd and 4th year
    },
    applicationLink: {
      type: String,
      trim: true,
      default: '',
    },
    cyclicPattern: {
      topHiringMonth: { type: String, default: 'September' },
      recurringQuarter: { type: String, default: 'Q3' },
      observedPattern: { type: String, default: '' },
      scheduleType: { type: String, enum: ['Confirmed', 'Estimated'], default: 'Estimated' },
      consistencyRate: { type: Number, default: 90 },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for job roles
companySchema.virtual('jobRoles', {
  ref: 'JobRole',
  localField: '_id',
  foreignField: 'company',
});

module.exports = mongoose.model('Company', companySchema);
