const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    hodName: {
      type: String,
      trim: true,
      default: 'Head of Department',
    },
    hodEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    hodPhone: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
