const mongoose = require('mongoose');

const recruitmentDriveSchema = new mongoose.Schema(
  {
    driveTitle: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    jobRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobRole',
      },
    ],
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
    driveType: {
      type: String,
      enum: ['On-Campus Mega Drive', 'Seasonal Hybrid Drive', 'Virtual Dream Drive', 'Pool Campus Drive', 'Regular / Special Drive'],
      default: 'On-Campus Mega Drive',
    },
    driveStartDate: {
      type: Date,
      required: [true, 'Drive start date is required'],
    },
    driveEndDate: {
      type: Date,
      required: [true, 'Drive end date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration / Notification deadline is required'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active / In Progress', 'Completed', 'Postponed', 'Cancelled'],
      default: 'Upcoming',
    },
    recruitmentMode: {
      type: String,
      enum: ['Virtual / Online', 'In-Person / On-Campus', 'Hybrid (Online Test + Offline Interview)'],
      default: 'Hybrid (Online Test + Offline Interview)',
    },
    recruitmentLocation: {
      type: String,
      default: 'Campus Placement Block, Auditorium A',
    },
    eligibleDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    eligibleDegrees: {
      type: [String],
      default: ['MCA', 'B.Tech CSE', 'B.Tech ISE', 'B.Tech ECE'],
    },
    allowedAcademicYears: {
      type: [Number],
      default: [3, 4], // 3rd Year and 4th Year
    },
    scheduleType: {
      type: String,
      enum: ['Confirmed', 'Estimated'],
      default: 'Confirmed',
    },
    applicationLink: {
      type: String,
      trim: true,
      default: '',
    },
    minCgpa: {
      type: Number,
      default: 6.5,
    },
    minTenth: {
      type: Number,
      default: 60,
    },
    minTwelfth: {
      type: Number,
      default: 60,
    },
    minDiploma: {
      type: Number,
      default: 60,
    },
    maxBacklogsAllowed: {
      type: Number,
      default: 0,
    },
    targetBatch: {
      type: Number,
      default: 2026,
    },
    interviewRounds: [
      {
        roundNumber: { type: Number, required: true },
        roundName: { type: String, required: true },
        mode: { type: String, enum: ['Online', 'Offline', 'Offline / In-Person', 'In-Person / On-Campus', 'Hybrid'], default: 'Online' },
        scheduledDate: { type: Date },
        duration: { type: String, default: '60 minutes' },
        description: { type: String, default: '' },
        topicsCovered: { type: [String], default: [] },
        passingCriteria: { type: String, default: 'Cutoff score / Top percentile' },
      },
    ],
    selectionProcessOverview: {
      type: String,
      default: '',
    },
    preparationGuidelines: {
      type: String,
      default: '',
    },
    instructionsForStudents: {
      type: String,
      default: 'Keep your formal attire ready, bring 3 printed resumes and college ID. Make sure your profile details are verified with department coordinator.',
    },
    salaryRange: {
      type: String,
      default: '8 - 14 LPA',
    },
    stipendMonthly: {
      type: Number,
      default: 35000,
    },
    totalOpenings: {
      type: Number,
      default: 25,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RecruitmentDrive', recruitmentDriveSchema);
