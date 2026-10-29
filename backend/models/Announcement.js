const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
    },
    category: {
      type: String,
      enum: [
        'Seasonal Drive Alert',
        'Drive Schedule Update',
        'Eligibility & Shortlist',
        'Interview Preparation Tip',
        'Company Registration Info',
        'General Placement Notice',
      ],
      default: 'Seasonal Drive Alert',
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    targetAudience: {
      type: String,
      default: 'All Students', // 'All Students', 'MCA', 'B.Tech CSE', etc.
    },
    postedByRole: {
      type: String,
      enum: ['admin', 'department'],
      default: 'admin',
    },
    postedByName: {
      type: String,
      default: 'Central Placement Cell',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    relatedDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecruitmentDrive',
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);
