const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID / USN is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    qualification: {
      type: String,
      default: 'MCA',
      trim: true,
    },
    batch: {
      type: Number,
      default: 2026,
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0.0, 'CGPA cannot be below 0'],
      max: [10.0, 'CGPA cannot exceed 10.0'],
      default: 7.5,
    },
    tenthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    twelfthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    skills: {
      type: [String],
      default: ['Java', 'Data Structures', 'SQL'],
    },
    phone: {
      type: String,
      trim: true,
      default: '+91 98765 00000',
    },
    github: {
      type: String,
      trim: true,
      default: 'https://github.com',
    },
    linkedin: {
      type: String,
      trim: true,
      default: 'https://linkedin.com',
    },
    placementStatus: {
      type: String,
      enum: ['Not Placed', 'Placed', 'Higher Studies'],
      default: 'Not Placed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
