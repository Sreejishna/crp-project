// Global Application Utilities & Shared UI Components
const CRP = {
  // Toast Alert Notification
  toast(message, type = 'info', title = '') {
    let container = document.getElementById('crp-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'crp-toast-container';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 320px; max-width: 420px;';
      document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass =
      type === 'success' ? 'bg-success text-white' :
      type === 'danger' ? 'bg-danger text-white' :
      type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

    const icon =
      type === 'success' ? 'bi-check-circle-fill' :
      type === 'danger' ? 'bi-exclamation-triangle-fill' :
      type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg mb-2 show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${icon} fs-5"></i>
            <div>
              ${title ? `<div class="fw-bold">${title}</div>` : ''}
              <div>${message}</div>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${toastId}').remove()"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);

    setTimeout(() => {
      const el = document.getElementById(toastId);
      if (el) el.remove();
    }, 4500);
  },

  // Format Dates
  formatDate(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDateTime(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Seasonal Quarter Classifier
  getSeasonBadge(seasonName) {
    if (!seasonName) return `<span class="badge bg-secondary">Seasonal</span>`;

    if (seasonName.includes('January') || seasonName.includes('Q1')) {
      return `<span class="badge-q1"><i class="bi bi-flower1"></i> Q1: Jan – Mar Hiring</span>`;
    } else if (seasonName.includes('April') || seasonName.includes('Q2')) {
      return `<span class="badge-q2"><i class="bi bi-sun-fill"></i> Q2: Apr – Jun Hiring</span>`;
    } else if (seasonName.includes('July') || seasonName.includes('Q3')) {
      return `<span class="badge-q3"><i class="bi bi-tree-fill"></i> Q3: Jul – Sep Mega Drive</span>`;
    } else if (seasonName.includes('October') || seasonName.includes('Q4')) {
      return `<span class="badge-q4"><i class="bi bi-snow"></i> Q4: Oct – Dec Winter Dream</span>`;
    } else {
      return `<span class="badge bg-dark text-white"><i class="bi bi-calendar-event"></i> Regular Hiring</span>`;
    }
  },

  // Status Badge
  getStatusBadge(status) {
    if (!status) return `<span class="badge bg-secondary">Upcoming</span>`;
    const s = status.toLowerCase();

    if (s.includes('active') || s.includes('progress') || s.includes('open')) {
      return `<span class="badge status-active px-3 py-2 rounded-pill"><i class="bi bi-broadcast me-1"></i> ${status}</span>`;
    } else if (s.includes('upcoming')) {
      return `<span class="badge status-upcoming px-3 py-2 rounded-pill"><i class="bi bi-clock-history me-1"></i> ${status}</span>`;
    } else {
      return `<span class="badge status-completed px-3 py-2 rounded-pill"><i class="bi bi-check2-all me-1"></i> ${status}</span>`;
    }
  },

  // Render Header / Navbar across pages
  renderNavbar(activePage = 'home') {
    const user = API.getUser();
    const token = API.getToken();

    const navContainer = document.getElementById('navbar-container');
    if (!navContainer) return;

    let roleNavLinks = '';

    if (user && token) {
      if (user.role === 'admin') {
        roleNavLinks = `
          <li class="nav-item"><a class="nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}" href="admin-dashboard.html"><i class="bi bi-speedometer2 me-1"></i> Admin Dashboard</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'admin-companies' ? 'active' : ''}" href="admin-companies.html"><i class="bi bi-building me-1"></i> Manage Companies</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'admin-drives' ? 'active' : ''}" href="admin-drives.html"><i class="bi bi-calendar-check me-1"></i> Manage Drives</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'admin-students' ? 'active' : ''}" href="admin-students.html"><i class="bi bi-people me-1"></i> Students</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'admin-departments' ? 'active' : ''}" href="admin-departments.html"><i class="bi bi-diagram-3 me-1"></i> Departments</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'admin-announcements' ? 'active' : ''}" href="admin-announcements.html"><i class="bi bi-megaphone me-1"></i> Notices</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'admin-statistics' ? 'active' : ''}" href="admin-statistics.html"><i class="bi bi-graph-up me-1"></i> Statistics</a></li>
        `;
      } else if (user.role === 'department') {
        roleNavLinks = `
          <li class="nav-item"><a class="nav-link ${activePage === 'department-dashboard' ? 'active' : ''}" href="department-dashboard.html"><i class="bi bi-speedometer2 me-1"></i> Dept Dashboard</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'companies' ? 'active' : ''}" href="companies.html"><i class="bi bi-building me-1"></i> Seasonal Hiring</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'seasonal-calendar' ? 'active' : ''}" href="seasonal-calendar.html"><i class="bi bi-calendar3 me-1"></i> Seasonal Calendar</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'skills-roadmap' ? 'active' : ''}" href="skills-roadmap.html"><i class="bi bi-mortarboard me-1"></i> Skills Roadmap</a></li>
        `;
      } else {
        // Student
        roleNavLinks = `
          <li class="nav-item"><a class="nav-link ${activePage === 'student-dashboard' ? 'active' : ''}" href="student-dashboard.html"><i class="bi bi-grid me-1"></i> My Dashboard</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'companies' ? 'active' : ''}" href="companies.html"><i class="bi bi-building me-1"></i> Seasonal Companies</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'seasonal-calendar' ? 'active' : ''}" href="seasonal-calendar.html"><i class="bi bi-calendar3 me-1"></i> Drive Calendar</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'skills-roadmap' ? 'active' : ''}" href="skills-roadmap.html"><i class="bi bi-mortarboard me-1"></i> Preparation & Roadmaps</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'student-profile' ? 'active' : ''}" href="student-profile.html"><i class="bi bi-person-circle me-1"></i> My Profile</a></li>
        `;
      }
    } else {
      // Guest Links
      roleNavLinks = `
        <li class="nav-item"><a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link ${activePage === 'companies' ? 'active' : ''}" href="companies.html">Seasonal Companies</a></li>
        <li class="nav-item"><a class="nav-link ${activePage === 'seasonal-calendar' ? 'active' : ''}" href="seasonal-calendar.html">Seasonal Calendar</a></li>
        <li class="nav-item"><a class="nav-link ${activePage === 'skills-roadmap' ? 'active' : ''}" href="skills-roadmap.html">Skills & Roadmap</a></li>
      `;
    }

    let userBadgeHtml = '';
    if (user && token) {
      const roleName =
        user.role === 'admin' ? 'Admin / Placement Cell' :
        user.role === 'department' ? `Department Coordinator` : `Student (${user.student_id || user.usn || user.degree || 'MCA'})`;

      const roleBadgeClass =
        user.role === 'admin' ? 'bg-danger' :
        user.role === 'department' ? 'bg-warning text-dark' : 'bg-primary';

      userBadgeHtml = `
        <div class="d-flex align-items-center gap-2">
          <div class="text-end d-none d-md-block">
            <div class="fw-bold text-dark small">${user.name}</div>
            <span class="badge ${roleBadgeClass} rounded-pill" style="font-size: 0.7rem;">${roleName}</span>
          </div>
          <button class="btn btn-outline-danger btn-sm rounded-pill px-3 ms-2" onclick="CRP.logout()">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      `;
    } else {
      userBadgeHtml = `
        <div class="d-flex align-items-center gap-2">
          <a href="login.html" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold">
            <i class="bi bi-box-arrow-in-right me-1"></i> Login
          </a>
          <a href="student-register.html" class="btn btn-primary-crp btn-sm rounded-pill px-3 fw-semibold">
            <i class="bi bi-person-plus me-1"></i> Register
          </a>
        </div>
      `;
    }

    navContainer.innerHTML = `
      <!-- Information Notice Top Bar -->
      <div class="portal-notice-bar d-flex justify-content-between align-items-center px-4">
        <span><i class="bi bi-info-circle-fill me-2"></i> <strong>Cyclic Recruitment Portal:</strong> Seasonal campus hiring, criteria verification, skill roadmaps & applications.</span>
        <span class="d-none d-lg-inline">Academic Year 2025–2026</span>
      </div>

      <!-- Demo Credentials Quick Switcher Banner -->
      <div class="demo-role-banner d-flex align-items-center justify-content-between px-4">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="badge bg-secondary"><i class="bi bi-key-fill me-1"></i> Quick Demo Logins:</span>
          <button class="btn btn-outline-primary btn-xs py-0 px-2 rounded" onclick="CRP.quickLogin('student')"><i class="bi bi-person"></i> Student (Rahul)</button>
          <button class="btn btn-outline-warning btn-xs py-0 px-2 rounded text-dark" onclick="CRP.quickLogin('department')"><i class="bi bi-diagram-3"></i> MCA Dept Coord</button>
          <button class="btn btn-outline-danger btn-xs py-0 px-2 rounded" onclick="CRP.quickLogin('admin')"><i class="bi bi-shield-lock"></i> Admin Officer</button>
        </div>
        <div class="d-none d-md-flex align-items-center gap-3 text-muted small">
          <span><i class="bi bi-shield-lock me-1"></i> Secure JWT Authentication Active</span>
        </div>
      </div>

      <!-- Main Sticky Navigation Bar -->
      <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container-fluid px-4">
          <a class="navbar-brand" href="index.html">
            <div class="brand-icon">
              <i class="bi bi-arrow-repeat"></i>
            </div>
            <div>
              <span class="text-primary">Cyclic</span>Recruit
              <span class="d-block text-muted" style="font-size: 0.68rem; font-weight: 600; letter-spacing: 0.05em;">COLLEGE SEASONAL PLACEMENT PORTAL</span>
            </div>
          </a>
          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#crpNavbarContent">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="crpNavbarContent">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
              ${roleNavLinks}
            </ul>
            <div class="d-flex align-items-center gap-2">
              ${userBadgeHtml}
            </div>
          </div>
        </div>
      </nav>
    `;
  },

  // Render Universal Footer
  renderFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer>
        <div class="container py-4">
          <div class="row g-4">
            <div class="col-lg-4">
              <div class="d-flex align-items-center gap-2 mb-3">
                <div class="brand-icon" style="width: 32px; height: 32px; font-size: 1rem;">
                  <i class="bi bi-arrow-repeat"></i>
                </div>
                <span class="brand-font fw-bold text-white fs-5">Cyclic Recruitment Portal</span>
              </div>
              <p class="small text-secondary mb-3">
                Centralized seasonal placement intelligence and recruitment drive tracking system for Engineering & MCA departments. Empowering students with transparent eligibility criteria, interview rounds, and preparation roadmaps.
              </p>
              <div class="d-flex gap-2">
                <span class="badge badge-q1">Q1: Jan-Mar</span>
                <span class="badge badge-q2">Q2: Apr-Jun</span>
                <span class="badge badge-q3">Q3: Jul-Sep</span>
                <span class="badge badge-q4">Q4: Oct-Dec</span>
              </div>
            </div>
            <div class="col-lg-2 col-6">
              <h6 class="text-white fw-bold mb-3">Portal Modules</h6>
              <ul class="list-unstyled small">
                <li class="mb-2"><a href="student-login.html">Student Module</a></li>
                <li class="mb-2"><a href="department-login.html">Department Module</a></li>
                <li class="mb-2"><a href="admin-login.html">Admin Placement Module</a></li>
                <li class="mb-2"><a href="student-register.html">Student Registration</a></li>
              </ul>
            </div>
            <div class="col-lg-3 col-6">
              <h6 class="text-white fw-bold mb-3">Seasonal Intelligence</h6>
              <ul class="list-unstyled small">
                <li class="mb-2"><a href="companies.html">Seasonal Companies</a></li>
                <li class="mb-2"><a href="seasonal-calendar.html">Recruitment Calendar</a></li>
                <li class="mb-2"><a href="skills-roadmap.html">DSA & Tech Roadmaps</a></li>
                <li class="mb-2"><a href="skills-roadmap.html">Interview Preparation Tips</a></li>
              </ul>
            </div>
            <div class="col-lg-3">
              <h6 class="text-white fw-bold mb-3">Central Placement Cell</h6>
              <p class="small mb-1"><i class="bi bi-geo-alt me-2 text-primary"></i> Administrative Block, Placement Division</p>
              <p class="small mb-1"><i class="bi bi-envelope me-2 text-primary"></i> placement.cell@crp.edu</p>
              <p class="small"><i class="bi bi-telephone me-2 text-primary"></i> +91 80 2345 6789</p>
              <div class="alert alert-dark py-2 px-3 small border-0 text-muted" style="background: #1e293b;">
                <i class="bi bi-shield-check text-success me-1"></i> Policy Notice: Information & Preparation Only
              </div>
            </div>
          </div>
          <hr class="my-4" style="border-color: #334155;">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
            <div>© 2026 Cyclic Recruitment Portal. All Rights Reserved.</div>
            <div class="mt-2 mt-md-0">
              <span class="me-3">Designed for College MCA & Engineering Placements</span>
              <a href="#" class="text-secondary me-2">Privacy</a>
              <a href="#" class="text-secondary">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  // Logout
  logout() {
    API.clearAuth();
    this.toast('Logged out successfully. Redirecting to Login...', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  },

  // Quick Demo Login Helper
  async quickLogin(role) {
    try {
      let email = 'rahul.mca@crp.edu';
      let password = 'student123';
      let redirectUrl = 'student-dashboard.html';

      if (role === 'admin') {
        email = 'admin@crp.edu';
        password = 'admin123';
        redirectUrl = 'admin-dashboard.html';
      } else if (role === 'department') {
        email = 'mca.coord@crp.edu';
        password = 'dept123';
        redirectUrl = 'department-dashboard.html';
      }

      this.toast(`Logging in as Demo ${role.toUpperCase()}...`, 'info');
      const res = await API.login(email, password, role);

      if (res.success) {
        API.setToken(res.token);
        API.setUser(res.user);
        this.toast(`Authenticated as ${res.user.name}! Redirecting...`, 'success');
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 600);
      }
    } catch (err) {
      this.toast(`Quick Login failed: ${err.message}`, 'danger');
    }
  },

  // Role Guard
  requireAuth(allowedRoles = []) {
    const user = API.getUser();
    const token = API.getToken();

    if (!token || !user) {
      this.toast('Please log in to access this page.', 'warning');
      window.location.href = 'login.html';
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      this.toast(`Access denied for role: ${user.role}`, 'danger');
      if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
      else if (user.role === 'department') window.location.href = 'department-dashboard.html';
      else window.location.href = 'student-dashboard.html';
      return false;
    }

    return true;
  },
};
