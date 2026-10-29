const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline / In-Person', 'Hybrid'],
    default: 'Online',
  },
  description: {
    type: String,
    default: '',
  },
});

const recruitmentDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    hiringSeason: {
      type: String,
      enum: [
        'January–March',
        'April–June',
        'July–September',
        'October–December',
      ],
      required: [true, 'Hiring season is required'],
    },
    seasonQuarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4'],
      default: 'Q1',
    },
    startDate: {
      type: Date,
      required: [true, 'Recruitment start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Recruitment end date is required'],
    },
    eligibleDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    minCgpa: {
      type: Number,
      default: 6.0,
      min: 0.0,
      max: 10.0,
    },
    maxBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    minTenth: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    minTwelfth: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    qualification: {
      type: String,
      default: 'MCA, B.Tech CSE, ISE, ECE',
    },
    requiredSkills: {
      type: [String],
      default: ['Data Structures', 'Java', 'SQL'],
    },
    vacancies: {
      type: Number,
      default: 10,
      min: 1,
    },
    salary: {
      type: String,
      required: [true, 'Salary or stipend package is required'],
      trim: true,
    },
    stipendMonthly: {
      type: Number,
      default: 0,
    },
    workLocation: {
      type: String,
      default: 'Bengaluru / Hybrid',
      trim: true,
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'Hybrid',
    },
    interviewRounds: [interviewRoundSchema],
    preparationTips: {
      type: [String],
      default: [
        'Revise Core Data Structures and Algorithms.',
        'Prepare clean Object-Oriented Design principles.',
        'Review final year project architecture and schema design.',
      ],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Closed'],
      default: 'Upcoming',
    },
  },
  { timestamps: true }
);

// Auto-derive seasonQuarter if hiringSeason is set
recruitmentDriveSchema.pre('save', function (next) {
  if (this.hiringSeason === 'January–March') this.seasonQuarter = 'Q1';
  else if (this.hiringSeason === 'April–June') this.seasonQuarter = 'Q2';
  else if (this.hiringSeason === 'July–September') this.seasonQuarter = 'Q3';
  else if (this.hiringSeason === 'October–December') this.seasonQuarter = 'Q4';
  next();
});

module.exports = mongoose.model('RecruitmentDrive', recruitmentDriveSchema);
