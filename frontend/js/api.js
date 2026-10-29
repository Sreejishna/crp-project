// Cyclic Recruitment Portal - API Client
const API_BASE_URL = (() => {
  if (typeof window === 'undefined') return 'http://localhost:5000/api';
  const origin = window.location.origin;
  if (!origin || origin === 'null' || window.location.protocol === 'file:') {
    return 'http://localhost:5000/api';
  }
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return `${origin}/api`;
  }
  return '/api';
})();

const API = {
  getToken() {
    return localStorage.getItem('crp_token');
  },

  setToken(token) {
    localStorage.setItem('crp_token', token);
  },

  getUser() {
    const u = localStorage.getItem('crp_user');
    return u ? JSON.parse(u) : null;
  },

  setUser(user) {
    localStorage.setItem('crp_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('crp_token');
    localStorage.removeItem('crp_user');
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: 'Server returned invalid response.',
      }));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
          this.clearAuth();
          // Optionally redirect if on protected page
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
      throw error;
    }
  },

  // Auth
  login(email, password, role) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  registerStudent(studentData) {
    return this.request('/auth/register-student', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  forgotPassword(email, newPassword, confirmPassword) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword, confirmPassword }),
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Companies
  getCompanies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/companies${query ? `?${query}` : ''}`);
  },

  getCompany(id) {
    return this.request(`/companies/${id}`);
  },

  createCompany(data) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCompany(id, data) {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCompany(id) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  },

  getSeasonalOverview() {
    return this.request('/companies/seasonal-overview');
  },

  // Recruitment Drives
  getDrives(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/drives${query ? `?${query}` : ''}`);
  },

  getDrive(id) {
    return this.request(`/drives/${id}`);
  },

  createDrive(data) {
    return this.request('/drives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDrive(id, data) {
    return this.request(`/drives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDrive(id) {
    return this.request(`/drives/${id}`, {
      method: 'DELETE',
    });
  },

  getSeasonalCalendar() {
    return this.request('/drives/seasonal-calendar');
  },

  // Departments
  getDepartments() {
    return this.request('/departments');
  },

  getDepartment(id) {
    return this.request(`/departments/${id}`);
  },

  createDepartment(data) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDepartment(id, data) {
    return this.request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDepartment(id) {
    return this.request(`/departments/${id}`, {
      method: 'DELETE',
    });
  },

  getDepartmentStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/departments/my/students${query ? `?${query}` : ''}`);
  },

  getDepartmentDashboard() {
    return this.request('/departments/my/dashboard');
  },

  getEligibleStudents(driveOrCompanyId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/departments/eligible-students/${driveOrCompanyId}${query ? `?${query}` : ''}`);
  },

  // Students (Admin)
  getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/students${query ? `?${query}` : ''}`);
  },

  getStudent(id) {
    return this.request(`/students/${id}`);
  },

  updateStudent(id, data) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  checkStudentEligibility(driveId) {
    return this.request(`/students/check-eligibility/${driveId}`);
  },

  // Announcements
  getAnnouncements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/announcements${query ? `?${query}` : ''}`);
  },

  createAnnouncement(data) {
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteAnnouncement(id) {
    return this.request(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // Skills & Roadmaps
  getRoadmaps(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/roadmaps${query ? `?${query}` : ''}`);
  },

  getRoadmap(id) {
    return this.request(`/roadmaps/${id}`);
  },

  createRoadmap(data) {
    return this.request('/roadmaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteRoadmap(id) {
    return this.request(`/roadmaps/${id}`, {
      method: 'DELETE',
    });
  },

  // Stats & Analytics
  getAdminStats() {
    return this.request('/stats/admin-dashboard');
  },

  getStudentDashboardStats() {
    return this.request('/stats/student-dashboard');
  },

  getAnalytics() {
    return this.request('/stats/analytics');
  },

  getPlacementRecords(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stats/placement-records${query ? `?${query}` : ''}`);
  },

  createPlacementRecord(data) {
    return this.request('/stats/placement-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Job Applications
  applyForDrive(driveId, data = {}) {
    return this.request(`/applications/apply/${driveId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyApplications() {
    return this.request('/applications/my-applications');
  },

  getAllApplications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/applications${query ? `?${query}` : ''}`);
  },

  updateApplicationStatus(id, status, notes = '') {
    return this.request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  },

  withdrawApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Historical Recruitment & Cyclic Tracking
  getCompanyHistoricalAnalysis(companyId) {
    return this.request(`/historical/company/${companyId}`);
  },

  getCyclicCalendar() {
    return this.request('/historical/calendar');
  },

  getPatternsSummary() {
    return this.request('/historical/patterns-summary');
  },

  getAllHistoricalRecords(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/historical${query ? `?${query}` : ''}`);
  },

  createHistoricalRecord(data) {
    return this.request('/historical', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateHistoricalRecord(id, data) {
    return this.request(`/historical/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteHistoricalRecord(id) {
    return this.request(`/historical/${id}`, {
      method: 'DELETE',
    });
  },

  // Student Bookmarks / Wishlist
  toggleBookmark(companyId) {
    return this.request(`/students/bookmarks/company/${companyId}`, {
      method: 'POST',
    });
  },

  getMyBookmarks() {
    return this.request('/students/bookmarks');
  },

  // Unified Eligibility Check (for Drive OR Company)
  checkEligibility(targetId) {
    return this.request(`/students/check-eligibility/${targetId}`);
  },
};
