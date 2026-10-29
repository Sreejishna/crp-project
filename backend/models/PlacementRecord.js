const mongoose = require('mongoose');

const placementRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    studentName: {
      type: String,
      required: true,
    },
    usn: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    companyName: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    packageLPA: {
      type: Number,
      required: true,
    },
    placementSeason: {
      type: String,
      enum: [
        'January - March Hiring',
        'April - June Hiring',
        'July - September Hiring',
        'October - December Hiring',
        'Year-Round / Regular',
      ],
      default: 'July - September Hiring',
    },
    placementYear: {
      type: Number,
      default: 2026,
    },
    offerType: {
      type: String,
      enum: ['Full Time (FTE)', 'Internship + FTE', 'Summer Internship'],
      default: 'Full Time (FTE)',
    },
    offerDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Offer Accepted', 'Offer Declined', 'Pending Verification'],
      default: 'Offer Accepted',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PlacementRecord', placementRecordSchema);
