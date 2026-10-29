const mongoose = require('mongoose');

const skillRoadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Skill/Roadmap title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Data Structures & Algorithms',
        'Full Stack Web Development',
        'Backend Engineering & Microservices',
        'Database & System Design',
        'Aptitude, Quantitative & Logical Reasoning',
        'Core CS (OS, DBMS, Networks, OOP)',
        'HR, Behavioral & Soft Skills',
        'Cloud, DevOps & Cyber Security',
      ],
      default: 'Data Structures & Algorithms',
    },
    targetSeason: {
      type: String,
      enum: [
        'January - March (Spring Internships & Drives)',
        'April - June (Summer Pre-Placement Prep)',
        'July - September (Autumn Mega Placement Season)',
        'October - December (Winter Dream & Pool Drives)',
        'All Seasons / Continuous Learning',
      ],
      default: 'All Seasons / Continuous Learning',
    },
    targetSeasonKey: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'All'],
      default: 'All',
    },
    description: {
      type: String,
      required: true,
    },
    estimatedHours: {
      type: Number,
      default: 40,
    },
    difficultyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Comprehensive'],
      default: 'Intermediate',
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    keyTopics: [
      {
        weekNumber: Number,
        topicName: String,
        details: String,
        mustSolveProblems: [String],
      },
    ],
    interviewPrepTips: {
      type: [String],
      default: [],
    },
    commonInterviewQuestions: [
      {
        question: String,
        answerTip: String,
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
        frequentCompanies: [String],
      },
    ],
    recommendedResources: [
      {
        title: String,
        url: String,
        resourceType: { type: String, enum: ['Documentation', 'Video Course', 'Practice Platform', 'Cheat Sheet', 'Book'], default: 'Documentation' },
        isFree: { type: Boolean, default: true },
      },
    ],
    associatedSkills: {
      type: [String],
      default: [],
    },
    publishedBy: {
      type: String,
      default: 'Central Placement Training Cell',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SkillRoadmap', skillRoadmapSchema);
