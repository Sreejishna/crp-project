const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    roleCategory: {
      type: String,
      enum: ['Software Engineering', 'Data Science & AI', 'Cloud & DevOps', 'Cyber Security', 'Full Stack Development', 'Product & QA', 'Consulting & Analytics', 'Backend Engineering & Microservices'],
      default: 'Software Engineering',
    },
    workMode: {
      type: String,
      enum: ['Onsite', 'Remote', 'Hybrid'],
      default: 'Hybrid',
    },
    location: {
      type: String,
      default: 'Bengaluru / Hyderabad / Pune',
    },
    vacancies: {
      type: Number,
      default: 10,
    },
    salaryPackage: {
      ctcMin: { type: Number, default: 6 },
      ctcMax: { type: Number, default: 12 },
      stipendMonthly: { type: Number, default: 30000 },
      currency: { type: String, default: 'LPA' },
    },
    qualifications: {
      type: [String],
      default: ['MCA', 'B.Tech CSE', 'B.Tech ISE', 'B.Tech ECE'],
    },
    minCgpa: {
      type: Number,
      default: 6.5,
    },
    maxBacklogs: {
      type: Number,
      default: 0,
    },
    experienceRequirement: {
      type: String,
      default: 'Freshers (2025 / 2026 Graduating Batch)',
    },
    technicalSkills: {
      type: [String],
      default: [],
    },
    softSkills: {
      type: [String],
      default: ['Problem Solving', 'Communication', 'Analytical Thinking', 'Teamwork'],
    },
    jobDescription: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    hiringSeason: {
      type: String,
      default: 'July - September Hiring',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobRole', jobRoleSchema);
