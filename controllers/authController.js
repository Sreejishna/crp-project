const User = require('../models/User');
const Student = require('../models/Student');
const Department = require('../models/Department');

/**
 * Render Login Page
 */
exports.getLogin = async (req, res) => {
  try {
    res.render('login', {
      title: 'Sign In | Cyclic Recruitment Portal',
    });
  } catch (err) {
    console.error('Error rendering login:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * Handle Login Form Submission
 */
exports.postLogin = async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Please provide both email and password.');
      return res.redirect('/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .populate('department')
      .populate('studentRef');

    if (!user) {
      req.flash('error_msg', 'Invalid credentials. User does not exist.');
      return res.redirect('/login');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials. Password is incorrect.');
      return res.redirect('/login');
    }

    // If expected role was selected from tabs, check match or guide user
    if (expectedRole && expectedRole !== user.role) {
      req.flash(
        'error_msg',
        `Account role mismatch: This email is registered as "${user.role.toUpperCase()}", not "${expectedRole.toUpperCase()}".`
      );
      return res.redirect('/login');
    }

    // Set session user
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.department ? user.department._id : null,
      departmentCode: user.department ? user.department.code : null,
      departmentName: user.department ? user.department.name : null,
      studentId: user.studentRef ? user.studentRef._id : null,
      studentRollNo: user.studentRef ? user.studentRef.studentId : null,
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);

    // Redirect to respective module dashboard
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'department') {
      return res.redirect('/department/dashboard');
    } else {
      return res.redirect('/student/dashboard');
    }
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error_msg', 'Server error during login. Please try again.');
    res.redirect('/login');
  }
};

/**
 * Render Student Registration Page
 */
exports.getRegister = async (req, res) => {
  try {
    const departments = await Department.find().sort({ code: 1 });
    res.render('register', {
      title: 'Student Registration | Cyclic Recruitment Portal',
      departments,
    });
  } catch (err) {
    console.error('Error rendering register:', err);
    res.status(500).render('500', { error: err.message, title: 'Server Error' });
  }
};

/**
 * Handle Student Registration
 */
exports.postRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      studentId,
      department,
      qualification,
      batch,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      skills,
      phone,
    } = req.body;

    const departments = await Department.find().sort({ code: 1 });

    if (!name || !email || !password || !studentId || !department) {
      req.flash('error_msg', 'Please fill in all mandatory fields.');
      return res.render('register', {
        title: 'Student Registration',
        departments,
        formData: req.body,
      });
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.render('register', {
        title: 'Student Registration',
        departments,
        formData: req.body,
      });
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters.');
      return res.render('register', {
        title: 'Student Registration',
        departments,
        formData: req.body,
      });
    }

    // Check existing email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error_msg', 'Email is already registered. Please sign in.');
      return res.render('register', {
        title: 'Student Registration',
        departments,
        formData: req.body,
      });
    }

    // Check existing studentId
    const existingStudent = await Student.findOne({
      studentId: studentId.toUpperCase().trim(),
    });
    if (existingStudent) {
      req.flash('error_msg', 'Student ID / USN already exists. Please verify.');
      return res.render('register', {
        title: 'Student Registration',
        departments,
        formData: req.body,
      });
    }

    // Parse skills array
    const parsedSkills = skills
      ? skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['Java', 'SQL', 'Data Structures'];

    // 1. Create User
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'student',
      department: department,
    });
    await newUser.save();

    // 2. Create Student
    const newStudent = new Student({
      user: newUser._id,
      studentId: studentId.toUpperCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department,
      qualification: qualification || 'MCA',
      batch: batch ? Number(batch) : 2026,
      cgpa: cgpa ? parseFloat(cgpa) : 7.0,
      tenthPercentage: tenthPercentage ? parseFloat(tenthPercentage) : 70,
      twelfthPercentage: twelfthPercentage ? parseFloat(twelfthPercentage) : 70,
      activeBacklogs: activeBacklogs ? parseInt(activeBacklogs) : 0,
      skills: parsedSkills,
      phone: phone || '+91 98765 00000',
    });
    await newStudent.save();

    // Link studentRef in User
    newUser.studentRef = newStudent._id;
    await newUser.save();

    // Update department student count
    await Department.findByIdAndUpdate(department, { $inc: { totalStudents: 1 } });

    req.flash(
      'success_msg',
      'Registration successful! You can now log in using your student credentials.'
    );
    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error_msg', 'Error during registration: ' + err.message);
    res.redirect('/register');
  }
};

/**
 * Handle Logout
 */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login?logout=true');
  });
};
