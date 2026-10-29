// Admin Placement Cell Module Logic
const AdminApp = {
  // 1. Initialize Admin Dashboard & Overview
  async initDashboard() {
    try {
      const res = await API.getAdminStats();
      if (res.success) {
        const stats = res.stats;

        // Metric Widgets
        document.getElementById('admin-stat-companies').textContent = stats.totalCompanies;
        document.getElementById('admin-stat-active-drives').textContent = stats.activeDrives;
        document.getElementById('admin-stat-upcoming-drives').textContent = stats.upcomingDrives;
        document.getElementById('admin-stat-students').textContent = stats.totalStudents;
        document.getElementById('admin-stat-depts').textContent = stats.totalDepartments;
        document.getElementById('admin-stat-placed').textContent = stats.placedStudents;
        document.getElementById('admin-stat-rate').textContent = `${stats.placementPercentage}%`;
        document.getElementById('admin-stat-avg-ctc').textContent = `₹${stats.avgCTC} LPA`;
        document.getElementById('admin-stat-max-ctc').textContent = `₹${stats.maxCTC} LPA`;

        // Render Recent Drives
        this.renderRecentDrives(res.recentDrives);

        // Render Recent Announcements
        this.renderRecentAnnouncements(res.recentAnnouncements);

        // Render Seasonal Breakdown
        this.renderSeasonalBreakdown(res.seasonalCompanies);

        // Load Student Applications
        await this.loadAllApplications();
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading admin dashboard: ' + err.message, 'danger');
    }
  },

  // Load and Render Student Applications
  async loadAllApplications() {
    const container = document.getElementById('admin-applications-table');
    if (!container) return;

    try {
      const statusFilter = document.getElementById('admin-app-filter-status')?.value || '';
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await API.getAllApplications(params);
      if (res.success) {
        const apps = res.applications || [];
        if (apps.length === 0) {
          container.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No student applications found for this filter.</td></tr>`;
          return;
        }

        const getStatusBadge = (status) => {
          switch (status) {
            case 'Selected':
              return `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i> Selected</span>`;
            case 'Shortlisted':
              return `<span class="badge bg-primary"><i class="bi bi-star-fill me-1"></i> Shortlisted</span>`;
            case 'Interview Scheduled':
              return `<span class="badge bg-info text-dark"><i class="bi bi-calendar-event me-1"></i> Interview</span>`;
            case 'Under Review':
              return `<span class="badge bg-warning text-dark"><i class="bi bi-hourglass me-1"></i> Under Review</span>`;
            case 'Rejected':
              return `<span class="badge bg-danger"><i class="bi bi-x me-1"></i> Rejected</span>`;
            default:
              return `<span class="badge bg-secondary">Applied</span>`;
          }
        };

        container.innerHTML = apps.map((app) => `
          <tr>
            <td>
              <div class="fw-bold text-dark">${app.student?.name || 'Student'}</div>
              <div class="text-muted small">${app.student?.student_id || app.student?.usn || 'N/A'} • ${app.student?.email || ''}</div>
            </td>
            <td>
              <span class="badge bg-light text-dark border">CGPA: ${app.student?.cgpa || '0'}</span>
              <span class="badge bg-light text-dark border">${app.student?.degree || 'MCA'}</span>
            </td>
            <td>
              <div class="fw-semibold text-dark">${app.company?.name || 'Company'}</div>
              <div class="text-muted small">${app.drive?.title || 'Drive'}</div>
            </td>
            <td class="text-muted small">${CRP.formatDate(app.appliedDate || app.createdAt)}</td>
            <td>${getStatusBadge(app.status)}</td>
            <td>
              <select class="form-select form-select-xs py-1" onchange="AdminApp.updateApplicationStatus('${app._id}', this.value)" style="font-size: 0.8rem; width: 140px;">
                <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                <option value="Interview Scheduled" ${app.status === 'Interview Scheduled' ? 'selected' : ''}>Interview</option>
                <option value="Selected" ${app.status === 'Selected' ? 'selected' : ''}>Selected (Placed)</option>
                <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      container.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-danger">Error loading applications: ${err.message}</td></tr>`;
    }
  },

  // Update Application Status
  async updateApplicationStatus(appId, status) {
    try {
      CRP.toast(`Updating status to ${status}...`, 'info');
      const res = await API.updateApplicationStatus(appId, status);
      if (res.success) {
        CRP.toast(res.message, 'success');
        await this.loadAllApplications();
      }
    } catch (err) {
      CRP.toast(err.message, 'danger', 'Status Update Failed');
    }
  },

  // Render Recent Drives
  renderRecentDrives(drives) {
    const container = document.getElementById('admin-recent-drives-table');
    if (!container) return;

    if (!drives || drives.length === 0) {
      container.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No drives scheduled yet.</td></tr>`;
      return;
    }

    container.innerHTML = drives.map((d) => `
      <tr>
        <td>
          <div class="fw-bold text-dark">${d.driveTitle}</div>
          <div class="text-muted small">${d.company?.name || 'Company'}</div>
        </td>
        <td>${CRP.getSeasonBadge(d.hiringSeason)}</td>
        <td>${CRP.formatDate(d.driveStartDate)}</td>
        <td>${CRP.getStatusBadge(d.status)}</td>
        <td class="fw-semibold text-dark">${d.salaryRange}</td>
        <td>
          <a href="drive-details.html?id=${d._id}" class="btn btn-outline-primary btn-xs py-1 px-2" title="View"><i class="bi bi-eye"></i></a>
          <a href="admin-drives.html" class="btn btn-outline-secondary btn-xs py-1 px-2" title="Edit"><i class="bi bi-pencil"></i></a>
        </td>
      </tr>
    `).join('');
  },

  // Render Announcements
  renderRecentAnnouncements(notices) {
    const container = document.getElementById('admin-recent-announcements');
    if (!container) return;

    if (!notices || notices.length === 0) {
      container.innerHTML = `<div class="p-3 text-muted">No notices posted.</div>`;
      return;
    }

    container.innerHTML = notices.map((n) => `
      <div class="p-2 mb-2 rounded bg-light border-start border-3 ${n.priority === 'Urgent' ? 'border-danger' : 'border-primary'} small">
        <div class="d-flex justify-content-between align-items-center">
          <span class="fw-bold text-dark">${n.title}</span>
          <span class="badge ${n.priority === 'Urgent' ? 'bg-danger' : 'bg-primary'}">${n.category}</span>
        </div>
        <div class="text-secondary mt-1">${n.content}</div>
        <div class="text-muted mt-1" style="font-size: 0.72rem;"><i class="bi bi-clock me-1"></i> ${CRP.formatDate(n.createdAt)}</div>
      </div>
    `).join('');
  },

  // Render Seasonal Breakdown
  renderSeasonalBreakdown(breakdown) {
    const container = document.getElementById('admin-seasonal-breakdown-list');
    if (!container) return;

    container.innerHTML = (breakdown || []).map((b) => `
      <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
        <span class="fw-semibold text-dark small">${b._id || 'Unassigned'}</span>
        <span class="badge bg-primary rounded-pill px-3">${b.count} Companies</span>
      </div>
    `).join('');
  },

  // 2. Company Management (CRUD)
  async initCompanyManagement() {
    await this.loadCompaniesTable();

    const form = document.getElementById('admin-company-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveCompany(e));
    }

    const searchInput = document.getElementById('admin-company-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.loadCompaniesTable());
    }

    // Load department checkboxes into Company Form
    await this.loadDepartmentCheckboxes();
  },

  async loadDepartmentCheckboxes() {
    try {
      const container = document.getElementById('company-eligible-depts-checkboxes');
      if (!container) return;

      const res = await API.getDepartments();
      if (res.success) {
        container.innerHTML = res.data.map((dept) => `
          <div class="form-check form-check-inline">
            <input class="form-check-input dept-check" type="checkbox" value="${dept._id}" id="chk-dept-${dept._id}">
            <label class="form-check-label small" for="chk-dept-${dept._id}">${dept.code} (${dept.name.split('(')[0].trim()})</label>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error(err);
    }
  },

  async loadCompaniesTable() {
    try {
      const search = document.getElementById('admin-company-search')?.value || '';
      const season = document.getElementById('admin-company-season-filter')?.value || 'All';
      const container = document.getElementById('admin-companies-table-body');
      const countEl = document.getElementById('admin-companies-count');

      if (!container) return;

      const res = await API.getCompanies({ search, season });
      if (res.success) {
        if (countEl) countEl.textContent = `${res.count} Companies Registered`;

        if (res.data.length === 0) {
          container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No companies found.</td></tr>`;
          return;
        }

        container.innerHTML = res.data.map((c) => `
          <tr>
            <td>
              <div class="d-flex align-items-center gap-2">
                <img src="${c.logo || 'https://ui-avatars.com/api/?name=Co'}" class="company-card-logo" style="width: 36px; height: 36px;" alt="${c.name}" onerror="this.src='https://ui-avatars.com/api/?name=Co'">
                <div>
                  <div class="fw-bold text-dark">${c.name}</div>
                  <div class="text-muted small">${c.industry}</div>
                </div>
              </div>
            </td>
            <td>${CRP.getSeasonBadge(c.hiringSeason)}</td>
            <td><span class="tier-badge ${c.tier?.includes('Super') ? 'tier-super-dream' : 'tier-dream'}">${c.tier}</span></td>
            <td class="fw-bold text-dark">${c.salaryRange}</td>
            <td>${CRP.getStatusBadge(c.recruitmentStatus)}</td>
            <td><span class="badge bg-light text-dark border">${c.eligibilityCriteria?.minCgpa || 7.0} CGPA</span></td>
            <td>
              <div class="btn-group btn-group-sm">
                <a href="company-details.html?id=${c._id}" class="btn btn-outline-primary" title="Preview"><i class="bi bi-eye"></i></a>
                <button class="btn btn-outline-secondary" onclick="AdminApp.openEditCompanyModal('${c._id}')" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger" onclick="AdminApp.deleteCompany('${c._id}', '${c.name}')" title="Delete"><i class="bi bi-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading companies: ' + err.message, 'danger');
    }
  },

  openAddCompanyModal() {
    const form = document.getElementById('admin-company-form');
    if (form) form.reset();
    document.getElementById('company-id-field').value = '';
    document.getElementById('company-modal-title').textContent = 'Add New Seasonal Recruitment Company';

    // Uncheck all depts
    document.querySelectorAll('.dept-check').forEach((cb) => (cb.checked = true));

    const modal = new bootstrap.Modal(document.getElementById('adminCompanyModal'));
    modal.show();
  },

  async openEditCompanyModal(id) {
    try {
      const res = await API.getCompany(id);
      if (res.success) {
        const c = res.data;
        document.getElementById('company-id-field').value = c._id;
        document.getElementById('company-modal-title').textContent = `Edit Company: ${c.name}`;

        document.getElementById('comp-input-name').value = c.name;
        document.getElementById('comp-input-industry').value = c.industry;
        document.getElementById('comp-input-tier').value = c.tier;
        document.getElementById('comp-input-season').value = c.hiringSeason;
        document.getElementById('comp-input-status').value = c.recruitmentStatus;
        document.getElementById('comp-input-website').value = c.website || '';
        document.getElementById('comp-input-ctc').value = c.salaryRange;
        document.getElementById('comp-input-stipend').value = c.stipendMonthly || 35000;
        document.getElementById('comp-input-vacancies').value = c.vacancies || 20;
        document.getElementById('comp-input-location').value = c.defaultLocation;
        document.getElementById('comp-input-workmode').value = c.defaultWorkMode;
        document.getElementById('comp-input-skills').value = (c.requiredSkills || []).join(', ');
        document.getElementById('comp-input-mincgpa').value = c.eligibilityCriteria?.minCgpa || 7.0;
        document.getElementById('comp-input-backlogs').value = c.eligibilityCriteria?.maxBacklogs || 0;
        document.getElementById('comp-input-desc').value = c.description;

        const modal = new bootstrap.Modal(document.getElementById('adminCompanyModal'));
        modal.show();
      }
    } catch (err) {
      CRP.toast('Error fetching company details: ' + err.message, 'danger');
    }
  },

  async handleSaveCompany(e) {
    e.preventDefault();
    try {
      const companyId = document.getElementById('company-id-field').value;

      const eligibleDeptIds = [];
      document.querySelectorAll('.dept-check:checked').forEach((cb) => eligibleDeptIds.push(cb.value));

      const payload = {
        name: document.getElementById('comp-input-name').value,
        industry: document.getElementById('comp-input-industry').value,
        tier: document.getElementById('comp-input-tier').value,
        hiringSeason: document.getElementById('comp-input-season').value,
        recruitmentStatus: document.getElementById('comp-input-status').value,
        website: document.getElementById('comp-input-website').value,
        salaryRange: document.getElementById('comp-input-ctc').value,
        stipendMonthly: Number(document.getElementById('comp-input-stipend').value),
        vacancies: Number(document.getElementById('comp-input-vacancies').value),
        defaultLocation: document.getElementById('comp-input-location').value,
        defaultWorkMode: document.getElementById('comp-input-workmode').value,
        requiredSkills: document.getElementById('comp-input-skills').value,
        description: document.getElementById('comp-input-desc').value,
        eligibilityCriteria: {
          minCgpa: Number(document.getElementById('comp-input-mincgpa').value),
          maxBacklogs: Number(document.getElementById('comp-input-backlogs').value),
          eligibleDepartments: eligibleDeptIds,
        },
      };

      let res;
      if (companyId) {
        res = await API.updateCompany(companyId, payload);
      } else {
        res = await API.createCompany(payload);
      }

      if (res.success) {
        CRP.toast(res.message, 'success');
        const modalEl = document.getElementById('adminCompanyModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        await this.loadCompaniesTable();
      }
    } catch (err) {
      CRP.toast('Error saving company: ' + err.message, 'danger');
    }
  },

  async deleteCompany(id, name) {
    if (!confirm(`Are you sure you want to delete '${name}' and all associated drives?`)) return;
    try {
      const res = await API.deleteCompany(id);
      if (res.success) {
        CRP.toast(res.message, 'success');
        await this.loadCompaniesTable();
      }
    } catch (err) {
      CRP.toast('Error deleting company: ' + err.message, 'danger');
    }
  },

  // 3. Recruitment Drive Management (CRUD)
  async initDriveManagement() {
    await this.loadDrivesTable();
    await this.loadCompaniesIntoDriveModal();

    const form = document.getElementById('admin-drive-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveDrive(e));
    }
  },

  async loadCompaniesIntoDriveModal() {
    try {
      const select = document.getElementById('drive-input-company');
      if (!select) return;

      const res = await API.getCompanies();
      if (res.success) {
        select.innerHTML = `
          <option value="">-- Select Company --</option>
          ${res.data.map((c) => `<option value="${c._id}">${c.name} (${c.hiringSeason})</option>`).join('')}
        `;
      }
    } catch (err) {
      console.error(err);
    }
  },

  async loadDrivesTable() {
    try {
      const container = document.getElementById('admin-drives-table-body');
      const countEl = document.getElementById('admin-drives-count');
      if (!container) return;

      const res = await API.getDrives();
      if (res.success) {
        if (countEl) countEl.textContent = `${res.count} Recruitment Drives Scheduled`;

        if (res.data.length === 0) {
          container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No recruitment drives found.</td></tr>`;
          return;
        }

        container.innerHTML = res.data.map((d) => `
          <tr>
            <td>
              <div class="fw-bold text-dark">${d.driveTitle}</div>
              <div class="text-muted small">${d.company?.name || 'Company'} • ${d.driveType}</div>
            </td>
            <td>${CRP.getSeasonBadge(d.hiringSeason)}</td>
            <td>${CRP.formatDate(d.driveStartDate)} - ${CRP.formatDate(d.driveEndDate)}</td>
            <td>${CRP.getStatusBadge(d.status)}</td>
            <td><span class="badge bg-light text-dark border">${d.minCgpa} CGPA</span></td>
            <td><span class="badge bg-primary-subtle text-primary border">${d.interviewRounds?.length || 0} Rounds</span></td>
            <td>
              <div class="btn-group btn-group-sm">
                <a href="drive-details.html?id=${d._id}" class="btn btn-outline-primary" title="View"><i class="bi bi-eye"></i></a>
                <button class="btn btn-outline-danger" onclick="AdminApp.deleteDrive('${d._id}', '${d.driveTitle}')" title="Delete"><i class="bi bi-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading drives: ' + err.message, 'danger');
    }
  },

  openAddDriveModal() {
    const form = document.getElementById('admin-drive-form');
    if (form) form.reset();
    document.getElementById('drive-id-field').value = '';

    const modal = new bootstrap.Modal(document.getElementById('adminDriveModal'));
    modal.show();
  },

  async handleSaveDrive(e) {
    e.preventDefault();
    try {
      const payload = {
        driveTitle: document.getElementById('drive-input-title').value,
        companyId: document.getElementById('drive-input-company').value,
        hiringSeason: document.getElementById('drive-input-season').value,
        driveType: document.getElementById('drive-input-type').value,
        driveStartDate: document.getElementById('drive-input-start').value,
        driveEndDate: document.getElementById('drive-input-end').value,
        registrationDeadline: document.getElementById('drive-input-deadline').value,
        status: document.getElementById('drive-input-status').value,
        recruitmentMode: document.getElementById('drive-input-mode').value,
        recruitmentLocation: document.getElementById('drive-input-venue').value,
        minCgpa: Number(document.getElementById('drive-input-mincgpa').value),
        maxBacklogsAllowed: Number(document.getElementById('drive-input-backlogs').value),
        salaryRange: document.getElementById('drive-input-salary').value,
        totalOpenings: Number(document.getElementById('drive-input-openings').value),
        instructionsForStudents: document.getElementById('drive-input-instructions').value,
      };

      const res = await API.createDrive(payload);
      if (res.success) {
        CRP.toast(res.message, 'success');
        const modalEl = document.getElementById('adminDriveModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        await this.loadDrivesTable();
      }
    } catch (err) {
      CRP.toast('Error scheduling drive: ' + err.message, 'danger');
    }
  },

  async deleteDrive(id, title) {
    if (!confirm(`Are you sure you want to remove drive: '${title}'?`)) return;
    try {
      const res = await API.deleteDrive(id);
      if (res.success) {
        CRP.toast(res.message, 'success');
        await this.loadDrivesTable();
      }
    } catch (err) {
      CRP.toast('Error deleting drive: ' + err.message, 'danger');
    }
  },

  // 4. Student Records Management
  async initStudentManagement() {
    await this.loadStudentsTable();

    const searchInput = document.getElementById('admin-student-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.loadStudentsTable());
    }
  },

  async loadStudentsTable() {
    try {
      const search = document.getElementById('admin-student-search')?.value || '';
      const minCgpa = document.getElementById('admin-student-cgpa-filter')?.value || '';
      const container = document.getElementById('admin-students-table-body');
      const countEl = document.getElementById('admin-students-count');

      if (!container) return;

      const res = await API.getStudents({ search, minCgpa });
      if (res.success) {
        if (countEl) countEl.textContent = `${res.count} Registered Students`;

        if (res.data.length === 0) {
          container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No student records found.</td></tr>`;
          return;
        }

        container.innerHTML = res.data.map((st) => `
          <tr>
            <td class="fw-bold text-dark">${st.name}</td>
            <td><span class="badge bg-light text-dark border">${st.usn || 'N/A'}</span></td>
            <td>${st.department?.code || 'MCA'} (${st.degree || 'MCA'})</td>
            <td><span class="badge ${st.cgpa >= 8.0 ? 'bg-success-subtle text-success border' : 'bg-primary-subtle text-primary border'} fw-bold">${st.cgpa}</span></td>
            <td><span class="badge ${st.activeBacklogs === 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">${st.activeBacklogs}</span></td>
            <td>
              ${st.isPlaced
                ? `<span class="badge bg-success text-white"><i class="bi bi-check2"></i> Placed (${st.placedPackage} LPA)</span>`
                : `<span class="badge bg-secondary-subtle text-secondary border">Unplaced</span>`}
            </td>
            <td>
              <button class="btn btn-outline-danger btn-xs py-1 px-2" onclick="AdminApp.deleteStudent('${st._id}', '${st.name}')" title="Delete Student Record"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading students: ' + err.message, 'danger');
    }
  },

  async deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to remove student: '${name}'?`)) return;
    try {
      const res = await API.deleteStudent(id);
      if (res.success) {
        CRP.toast(res.message, 'success');
        await this.loadStudentsTable();
      }
    } catch (err) {
      CRP.toast('Error deleting student: ' + err.message, 'danger');
    }
  },

  // 5. Department Management
  async initDepartmentManagement() {
    await this.loadDepartmentsTable();

    const form = document.getElementById('admin-dept-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveDepartment(e));
    }
  },

  async loadDepartmentsTable() {
    try {
      const container = document.getElementById('admin-departments-table-body');
      if (!container) return;

      const res = await API.getDepartments();
      if (res.success) {
        container.innerHTML = res.data.map((d) => `
          <tr>
            <td class="fw-bold text-dark">${d.name}</td>
            <td><span class="badge bg-primary-subtle text-primary border">${d.code}</span></td>
            <td>
              <div class="fw-semibold text-dark">${d.hodName}</div>
              <div class="text-muted small">${d.hodEmail}</div>
            </td>
            <td><span class="badge bg-light text-dark border">${d.totalStudents} Students</span></td>
            <td><span class="badge bg-success-subtle text-success border">${d.placedStudents} Placed</span></td>
            <td>
              <button class="btn btn-outline-danger btn-xs py-1 px-2" onclick="AdminApp.deleteDepartment('${d._id}', '${d.name}')" title="Delete"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading departments: ' + err.message, 'danger');
    }
  },

  async handleSaveDepartment(e) {
    e.preventDefault();
    try {
      const payload = {
        name: document.getElementById('dept-input-name').value,
        code: document.getElementById('dept-input-code').value,
        hodName: document.getElementById('dept-input-hod-name').value,
        hodEmail: document.getElementById('dept-input-hod-email').value,
        hodPhone: document.getElementById('dept-input-hod-phone').value,
        description: document.getElementById('dept-input-desc').value,
      };

      const res = await API.createDepartment(payload);
      if (res.success) {
        CRP.toast('Department created successfully!', 'success');
        document.getElementById('admin-dept-form').reset();
        await this.loadDepartmentsTable();
      }
    } catch (err) {
      CRP.toast('Error adding department: ' + err.message, 'danger');
    }
  },

  async deleteDepartment(id, name) {
    if (!confirm(`Are you sure you want to delete department: '${name}'?`)) return;
    try {
      const res = await API.deleteDepartment(id);
      if (res.success) {
        CRP.toast(res.message, 'success');
        await this.loadDepartmentsTable();
      }
    } catch (err) {
      CRP.toast('Error deleting department: ' + err.message, 'danger');
    }
  },

  // 6. Announcements Management
  async initAnnouncementManagement() {
    await this.loadAnnouncementsTable();

    const form = document.getElementById('admin-announcement-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveAnnouncement(e));
    }
  },

  async loadAnnouncementsTable() {
    try {
      const container = document.getElementById('admin-announcements-table-body');
      if (!container) return;

      const res = await API.getAnnouncements();
      if (res.success) {
        container.innerHTML = res.data.map((n) => `
          <tr>
            <td>
              <div class="fw-bold text-dark">${n.title} ${n.isPinned ? '<i class="bi bi-pin-angle-fill text-danger"></i>' : ''}</div>
              <div class="text-secondary small text-truncate" style="max-width: 320px;">${n.content}</div>
            </td>
            <td><span class="badge bg-primary-subtle text-primary border">${n.category}</span></td>
            <td><span class="badge ${n.priority === 'Urgent' ? 'bg-danger' : n.priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary'}">${n.priority}</span></td>
            <td>${n.targetAudience}</td>
            <td class="text-muted small">${CRP.formatDate(n.createdAt)}</td>
            <td>
              <button class="btn btn-outline-danger btn-xs py-1 px-2" onclick="AdminApp.deleteAnnouncement('${n._id}')"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading announcements: ' + err.message, 'danger');
    }
  },

  async handleSaveAnnouncement(e) {
    e.preventDefault();
    try {
      const payload = {
        title: document.getElementById('ann-input-title').value,
        content: document.getElementById('ann-input-content').value,
        category: document.getElementById('ann-input-category').value,
        priority: document.getElementById('ann-input-priority').value,
        targetAudience: document.getElementById('ann-input-audience').value,
        isPinned: document.getElementById('ann-input-pinned').checked,
      };

      const res = await API.createAnnouncement(payload);
      if (res.success) {
        CRP.toast('Announcement published!', 'success');
        document.getElementById('admin-announcement-form').reset();
        await this.loadAnnouncementsTable();
      }
    } catch (err) {
      CRP.toast('Error publishing announcement: ' + err.message, 'danger');
    }
  },

  async deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await API.deleteAnnouncement(id);
      if (res.success) {
        CRP.toast(res.message, 'success');
        await this.loadAnnouncementsTable();
      }
    } catch (err) {
      CRP.toast('Error deleting notice: ' + err.message, 'danger');
    }
  },

  // 7. Interactive Analytics & Visual Charts (Chart.js)
  async initAnalytics() {
    try {
      const res = await API.getAnalytics();
      if (res.success) {
        const { departmentStats, seasonalDistribution, tierDistribution, industryBreakdown } = res;

        // Chart 1: Department-wise Placement Rate
        const deptCtx = document.getElementById('chart-department-rates')?.getContext('2d');
        if (deptCtx) {
          new Chart(deptCtx, {
            type: 'bar',
            data: {
              labels: departmentStats.map((d) => d.code),
              datasets: [
                {
                  label: 'Placement Rate (%)',
                  data: departmentStats.map((d) => d.placementRate),
                  backgroundColor: 'rgba(79, 70, 229, 0.85)',
                  borderRadius: 6,
                },
                {
                  label: 'Average Package (LPA)',
                  data: departmentStats.map((d) => d.avgPackageLPA),
                  backgroundColor: 'rgba(16, 185, 129, 0.85)',
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: { legend: { position: 'top' } },
            },
          });
        }

        // Chart 2: Seasonal Company Distribution
        const seasonCtx = document.getElementById('chart-seasonal-distribution')?.getContext('2d');
        if (seasonCtx) {
          new Chart(seasonCtx, {
            type: 'doughnut',
            data: {
              labels: seasonalDistribution.map((s) => s._id.split(' ')[0] + ' Cycle'),
              datasets: [
                {
                  data: seasonalDistribution.map((s) => s.companyCount),
                  backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
                },
              ],
            },
            options: {
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
            },
          });
        }

        // Chart 3: Tier Distribution
        const tierCtx = document.getElementById('chart-tier-distribution')?.getContext('2d');
        if (tierCtx) {
          new Chart(tierCtx, {
            type: 'pie',
            data: {
              labels: tierDistribution.map((t) => t._id.split('(')[0].trim()),
              datasets: [
                {
                  data: tierDistribution.map((t) => t.count),
                  backgroundColor: ['#EC4899', '#8B5CF6', '#3B82F6', '#64748B'],
                },
              ],
            },
            options: {
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
            },
          });
        }
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error initializing analytics charts: ' + err.message, 'danger');
    }
  },
};
