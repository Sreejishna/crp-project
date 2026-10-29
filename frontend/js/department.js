// Department Module Logic
const DeptApp = {
  // 1. Initialize Department Dashboard
  async initDashboard() {
    try {
      const res = await API.getDepartmentDashboard();
      if (res.success) {
        const dept = res.department;
        const stats = res.stats;

        // Populate Dept Info
        document.getElementById('dept-name-heading').textContent = dept ? dept.name : 'Department of MCA';
        document.getElementById('dept-code-badge').textContent = dept ? dept.code : 'MCA';
        document.getElementById('dept-hod-info').textContent = dept ? `HOD: ${dept.hodName} (${dept.hodEmail})` : '';

        // Populate Stat Cards
        document.getElementById('stat-total-students').textContent = stats.totalStudents;
        document.getElementById('stat-placed-students').textContent = stats.placedStudents;
        document.getElementById('stat-placement-rate').textContent = `${stats.placementPercentage}%`;
        document.getElementById('stat-upcoming-drives').textContent = stats.upcomingDrivesCount;

        // Render Upcoming Drives for Department
        this.renderUpcomingDrives(res.upcomingDrives);

        // Render Recent Placements
        this.renderRecentPlacements(res.recentPlacements);

        // Render Department Announcements
        this.renderAnnouncements(res.announcements);

        // Load Drives/Companies into Eligibility Matcher Dropdown
        await this.loadDrivesIntoMatcher();

        // Load Department Student Roster
        await this.loadDepartmentStudents();
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading department dashboard: ' + err.message, 'danger');
    }
  },

  // Render Upcoming Drives
  renderUpcomingDrives(drives) {
    const container = document.getElementById('dept-upcoming-drives');
    if (!container) return;

    if (!drives || drives.length === 0) {
      container.innerHTML = `<div class="p-3 text-muted">No upcoming drives scheduled for this department currently.</div>`;
      return;
    }

    container.innerHTML = drives.map((d) => `
      <div class="crp-card p-3 mb-3 border-start border-4 border-primary">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 class="fw-bold text-dark mb-0">${d.driveTitle}</h6>
            <div class="text-muted small">${d.company?.name} • ${d.company?.tier}</div>
          </div>
          ${CRP.getSeasonBadge(d.hiringSeason)}
        </div>
        <div class="row g-2 text-muted small my-2">
          <div class="col-sm-6"><i class="bi bi-calendar text-primary me-1"></i> ${CRP.formatDate(d.driveStartDate)}</div>
          <div class="col-sm-6"><i class="bi bi-mortarboard text-warning me-1"></i> Min CGPA: <strong>${d.minCgpa}</strong></div>
        </div>
        <div class="d-flex justify-content-between align-items-center border-top pt-2">
          <span class="badge bg-light text-dark border">Salary: ${d.salaryRange}</span>
          <button class="btn btn-outline-primary btn-xs py-1 px-2" onclick="DeptApp.matchEligibilityForDrive('${d._id}')">
            <i class="bi bi-people-fill me-1"></i> Find Eligible Students
          </button>
        </div>
      </div>
    `).join('');
  },

  // Render Recent Placements
  renderRecentPlacements(placements) {
    const container = document.getElementById('dept-placements-table-body');
    if (!container) return;

    if (!placements || placements.length === 0) {
      container.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-muted">No placed student records added yet.</td></tr>`;
      return;
    }

    container.innerHTML = placements.map((p) => `
      <tr>
        <td class="fw-bold text-dark">${p.studentName}</td>
        <td><span class="badge bg-light text-dark border">${p.usn}</span></td>
        <td>
          <div class="fw-semibold text-dark">${p.companyName}</div>
          <div class="text-muted small">${p.jobRole}</div>
        </td>
        <td class="fw-bold text-success">${p.packageLPA} LPA</td>
        <td><span class="badge bg-success-subtle text-success border">${p.status}</span></td>
      </tr>
    `).join('');
  },

  // Render Announcements
  renderAnnouncements(notices) {
    const container = document.getElementById('dept-notices-container');
    if (!container) return;

    if (!notices || notices.length === 0) {
      container.innerHTML = `<div class="text-muted small">No department notices posted yet.</div>`;
      return;
    }

    container.innerHTML = notices.map((n) => `
      <div class="p-2 mb-2 rounded bg-light border-start border-3 border-warning small">
        <div class="fw-bold text-dark">${n.title}</div>
        <div class="text-secondary">${n.content}</div>
        <div class="text-muted mt-1" style="font-size: 0.72rem;">${CRP.formatDate(n.createdAt)} • Target: ${n.targetAudience}</div>
      </div>
    `).join('');
  },

  // Load Department Students Roster
  async loadDepartmentStudents() {
    try {
      const container = document.getElementById('dept-students-table-body');
      const countBadge = document.getElementById('dept-students-count');
      if (!container) return;

      const res = await API.getDepartmentStudents();
      if (res.success) {
        if (countBadge) countBadge.textContent = `${res.count} Enrolled Students`;

        if (res.data.length === 0) {
          container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No students found in this department.</td></tr>`;
          return;
        }

        container.innerHTML = res.data.map((st) => `
          <tr>
            <td class="fw-bold text-dark">${st.name}</td>
            <td><span class="badge bg-light text-dark border">${st.usn || 'N/A'}</span></td>
            <td>${st.email}</td>
            <td><span class="badge ${st.cgpa >= 8.0 ? 'bg-success-subtle text-success border' : st.cgpa >= 6.5 ? 'bg-primary-subtle text-primary border' : 'bg-warning-subtle text-warning border'} fw-bold">${st.cgpa}</span></td>
            <td><span class="badge ${st.activeBacklogs === 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">${st.activeBacklogs} Backlogs</span></td>
            <td>
              <div class="d-flex gap-1 flex-wrap" style="max-width: 200px;">
                ${(st.skills || []).slice(0, 3).map((s) => `<span class="badge bg-light text-secondary border" style="font-size: 0.7rem;">${s}</span>`).join('')}
              </div>
            </td>
            <td>
              ${st.isPlaced
                ? `<span class="badge bg-success-subtle text-success border"><i class="bi bi-check-circle me-1"></i> Placed @ ${st.placedCompany} (${st.placedPackage} LPA)</span>`
                : `<span class="badge bg-secondary-subtle text-secondary border">Unplaced / Seeking</span>`}
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error(err);
    }
  },

  // Load Drives into Eligibility Matcher Dropdown
  async loadDrivesIntoMatcher() {
    try {
      const select = document.getElementById('matcher-drive-select');
      if (!select) return;

      const res = await API.getDrives();
      if (res.success) {
        select.innerHTML = `
          <option value="">-- Choose Recruitment Drive to Match --</option>
          ${res.data.map((d) => `<option value="${d._id}">${d.company?.name || 'Co'} - ${d.driveTitle} (Min CGPA: ${d.minCgpa}, ${d.hiringSeason})</option>`).join('')}
        `;
      }
    } catch (err) {
      console.error(err);
    }
  },

  // Perform Dynamic Student Matching
  async runEligibilityMatcher() {
    const driveId = document.getElementById('matcher-drive-select')?.value;
    if (!driveId) {
      CRP.toast('Please select a recruitment drive from the dropdown.', 'warning');
      return;
    }
    await this.matchEligibilityForDrive(driveId);
  },

  async matchEligibilityForDrive(driveId) {
    try {
      const select = document.getElementById('matcher-drive-select');
      if (select) select.value = driveId;

      CRP.toast('Evaluating department student eligibility criteria...', 'info');
      const res = await API.getEligibleStudents(driveId);

      if (res.success) {
        const resultsContainer = document.getElementById('matcher-results-container');
        if (!resultsContainer) return;

        resultsContainer.classList.remove('d-none');

        // Stats
        document.getElementById('matcher-total-evaluated').textContent = res.stats.totalEvaluated;
        document.getElementById('matcher-eligible-count').textContent = res.stats.eligibleCount;
        document.getElementById('matcher-ineligible-count').textContent = res.stats.ineligibleCount;
        document.getElementById('matcher-rate').textContent = `${res.stats.eligibilityRate}%`;

        // Criteria Box
        document.getElementById('matcher-criteria-summary').innerHTML = `
          <strong>Drive:</strong> ${res.criteria.targetTitle} (${res.criteria.companyName}) |
          <strong>Min CGPA:</strong> ${res.criteria.minCgpa} |
          <strong>10th / 12th:</strong> ${res.criteria.minTenth}% / ${res.criteria.minTwelfth}% |
          <strong>Max Backlogs:</strong> ${res.criteria.maxBacklogs}
        `;

        // Render Eligible Students Table
        const eligibleTable = document.getElementById('matcher-eligible-table-body');
        if (eligibleTable) {
          if (res.eligibleStudents.length === 0) {
            eligibleTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No students met all criteria.</td></tr>`;
          } else {
            eligibleTable.innerHTML = res.eligibleStudents.map((st) => `
              <tr class="table-success-subtle">
                <td class="fw-bold text-dark"><i class="bi bi-check-circle-fill text-success me-1"></i> ${st.name}</td>
                <td><span class="badge bg-white text-dark border">${st.usn || 'N/A'}</span></td>
                <td class="fw-bold text-success">${st.cgpa}</td>
                <td>${st.email}</td>
                <td>
                  <span class="badge bg-success text-white">${st.skillMatchPercent}% Skill Match</span>
                  <div class="small text-muted">${(st.matchedSkills || []).join(', ') || 'General CS'}</div>
                </td>
              </tr>
            `).join('');
          }
        }

        // Render Ineligible Students Table
        const ineligibleTable = document.getElementById('matcher-ineligible-table-body');
        if (ineligibleTable) {
          if (res.ineligibleStudents.length === 0) {
            ineligibleTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">All students in department are eligible!</td></tr>`;
          } else {
            ineligibleTable.innerHTML = res.ineligibleStudents.map((st) => `
              <tr>
                <td class="fw-semibold text-dark">${st.name}</td>
                <td><span class="badge bg-light text-dark border">${st.usn || 'N/A'}</span></td>
                <td>${st.cgpa}</td>
                <td>
                  ${st.ineligibleReasons.map((r) => `<span class="badge bg-danger-subtle text-danger border me-1 mb-1" style="font-size: 0.72rem;">${r}</span>`).join('')}
                </td>
              </tr>
            `).join('');
          }
        }

        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error matching students: ' + err.message, 'danger');
    }
  },

  // Share Notice from Department to Students
  async postDepartmentNotice(event) {
    event.preventDefault();
    try {
      const title = document.getElementById('notice-title').value;
      const content = document.getElementById('notice-content').value;
      const priority = document.getElementById('notice-priority').value;
      const category = document.getElementById('notice-category').value;

      const res = await API.createAnnouncement({
        title,
        content,
        priority,
        category,
        targetAudience: 'MCA',
      });

      if (res.success) {
        CRP.toast('Department announcement shared with students!', 'success');
        document.getElementById('dept-notice-form').reset();
        await this.initDashboard();
      }
    } catch (err) {
      CRP.toast('Error posting notice: ' + err.message, 'danger');
    }
  },

  // Record Placement Offer for Department Student
  async recordPlacement(event) {
    event.preventDefault();
    try {
      const studentId = document.getElementById('place-student-id').value;
      const companyId = document.getElementById('place-company-id').value;
      const jobRole = document.getElementById('place-job-role').value;
      const packageLPA = document.getElementById('place-ctc').value;

      const res = await API.createPlacementRecord({
        studentId,
        companyId,
        jobRole,
        packageLPA,
      });

      if (res.success) {
        CRP.toast(res.message, 'success');
        document.getElementById('dept-placement-form').reset();
        await this.initDashboard();
      }
    } catch (err) {
      CRP.toast('Failed to record placement: ' + err.message, 'danger');
    }
  },
};
