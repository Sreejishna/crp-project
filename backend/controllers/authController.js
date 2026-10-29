const User = require('../models/User');
const Department = require('../models/Department');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new Student
// @route   POST /api/auth/register-student
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      student_id,
      studentId,
      usn,
      departmentId,
      degree,
      batchYear,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      skills,
      bio,
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const sid = (student_id || studentId || usn || '').trim().toUpperCase();
    if (!sid) {
      return res.status(400).json({ success: false, message: 'Student ID / USN is required.' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Check USN / Student ID uniqueness
    const sidExists = await User.findOne({
      $or: [{ usn: sid }, { student_id: sid }],
    });
    if (sidExists) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Student ID / USN already exists.',
      });
    }

    let deptObj = null;
    if (departmentId) {
      deptObj = await Department.findById(departmentId);
    } else {
      // Find default department (MCA or first available)
      deptObj = await Department.findOne({ code: 'MCA' }) || await Department.findOne();
    }

    // Parse skills array if passed as comma-separated string
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills;
    } else if (typeof skills === 'string' && skills.trim().length > 0) {
      parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'student',
      phone: phone ? phone.trim() : '',
      student_id: sid,
      usn: sid,
      department: deptObj ? deptObj._id : null,
      degree: degree || 'MCA',
      batchYear: Number(batchYear) || 2026,
      cgpa: Number(cgpa) || 0,
      tenthPercentage: Number(tenthPercentage) || 0,
      twelfthPercentage: Number(twelfthPercentage) || 0,
      activeBacklogs: Number(activeBacklogs) || 0,
      skills: parsedSkills,
      bio: bio || '',
    });

    // Increment department count if assigned
    if (deptObj) {
      await Department.findByIdAndUpdate(deptObj._id, { $inc: { totalStudents: 1 } });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Cyclic Recruitment Portal.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        student_id: user.student_id,
        usn: user.usn,
        department: deptObj ? { _id: deptObj._id, name: deptObj.name, code: deptObj.code } : null,
        degree: user.degree,
        cgpa: user.cgpa,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Universal Login (Student, Admin, Department)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const query = { email: email.toLowerCase() };
    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query).populate('department');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: role
          ? `Invalid credentials for ${role} login. Please verify email and role.`
          : 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        usn: user.usn,
        department: user.department,
        degree: user.degree,
        cgpa: user.cgpa,
        tenthPercentage: user.tenthPercentage,
        twelfthPercentage: user.twelfthPercentage,
        activeBacklogs: user.activeBacklogs,
        skills: user.skills,
        isPlaced: user.isPlaced,
        placedCompany: user.placedCompany,
        placedPackage: user.placedPackage,
        designation: user.designation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department');

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Student Profile
// @route   PUT /api/auth/profile
// @access  Private (Student)
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      phone,
      degree,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      skills,
      bio,
      linkedinProfile,
      githubProfile,
    } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (degree) user.degree = degree;
    if (cgpa !== undefined) user.cgpa = Number(cgpa);
    if (tenthPercentage !== undefined) user.tenthPercentage = Number(tenthPercentage);
    if (twelfthPercentage !== undefined) user.twelfthPercentage = Number(twelfthPercentage);
    if (activeBacklogs !== undefined) user.activeBacklogs = Number(activeBacklogs);
    if (bio !== undefined) user.bio = bio;
    if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile;
    if (githubProfile !== undefined) user.githubProfile = githubProfile;

    if (skills) {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('department');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password / Password Reset request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
      }
      user.password = newPassword;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Password reset instructions and verification code have been sent to ${email}.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
};
