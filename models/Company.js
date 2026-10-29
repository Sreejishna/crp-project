const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    tier: {
      type: String,
      enum: [
        'Super Dream (15+ LPA)',
        'Dream (8-15 LPA)',
        'Tier-1 Core (5-8 LPA)',
        'Mass / Regular (3.5-5 LPA)',
      ],
      default: 'Dream (8-15 LPA)',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: 'https://example.com',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&auto=format&fit=crop&q=80',
    },
    headquarters: {
      type: String,
      trim: true,
      default: 'Bengaluru / Hyderabad',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'campus@company.com',
    },
    contactPerson: {
      type: String,
      trim: true,
      default: 'Campus Talent Acquisition Team',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
