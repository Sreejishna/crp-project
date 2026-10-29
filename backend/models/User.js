const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'department', 'teacher'],
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    // Fields specific to Student
    student_id: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    usn: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    degree: {
      type: String,
      trim: true,
      default: 'MCA', // MCA, B.Tech CSE, B.Tech ECE, etc.
    },
    academicYear: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 4, // 1st, 2nd, 3rd, 4th Year
    },
    batchYear: {
      type: Number,
      default: 2026,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    tenthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    twelfthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    diplomaPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    activeBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    arrears: {
      type: Number,
      min: 0,
      default: 0,
    },
    bookmarkedCompanies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
    },
    linkedinProfile: {
      type: String,
      default: '',
    },
    githubProfile: {
      type: String,
      default: '',
    },
    isPlaced: {
      type: Boolean,
      default: false,
    },
    placedCompany: {
      type: String,
      default: '',
    },
    placedPackage: {
      type: Number,
      default: 0,
    },
    // Fields specific to Department Coordinator / Staff
    designation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving & sync student_id/usn
userSchema.pre('save', async function () {
  if (this.student_id && !this.usn) {
    this.usn = this.student_id;
  } else if (this.usn && !this.student_id) {
    this.student_id = this.usn;
  }
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
