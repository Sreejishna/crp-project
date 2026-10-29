const mongoose = require('mongoose');

const placementRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    recruitmentDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecruitmentDrive',
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    package: {
      type: String,
      required: [true, 'Salary/CTC package is required'],
      trim: true,
    },
    placementStatus: {
      type: String,
      enum: ['Selected', 'Placed', 'Offer Accepted'],
      default: 'Placed',
    },
    placedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementRecord', placementRecordSchema);
