/**
 * Authentication and Role-Based Authorization Middleware
 * Cyclic Recruitment Portal (CRP)
 */

const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Please log in to access this page.');
  return res.redirect('/login');
};

const forwardAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    const role = req.session.user.role;
    if (role === 'admin') return res.redirect('/admin/dashboard');
    if (role === 'department') return res.redirect('/department/dashboard');
    if (role === 'student') return res.redirect('/student/dashboard');
  }
  return next();
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash('error_msg', 'Session expired. Please log in again.');
      return res.redirect('/login');
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      req.flash(
        'error_msg',
        `Access Denied: You do not have permissions for this section (${req.session.user.role}).`
      );

      // Redirect to their own dashboard
      if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
      if (req.session.user.role === 'department') return res.redirect('/department/dashboard');
      if (req.session.user.role === 'student') return res.redirect('/student/dashboard');
      return res.redirect('/');
    }

    next();
  };
};

module.exports = {
  ensureAuthenticated,
  forwardAuthenticated,
  authorizeRoles,
};
