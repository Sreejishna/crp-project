const StudentApp = {
  // 1. Initialize Student Dashboard
  async initDashboard() {
    try {
      const user = API.getUser();
      if (user) {
        const welcomeEl = document.getElementById('student-welcome-name');
        if (welcomeEl) welcomeEl.textContent = user.name;
        const usnEl = document.getElementById('student-usn-badge');
        if (usnEl) usnEl.textContent = `${user.student_id || user.usn || 'MCA'} • CGPA: ${user.cgpa || '8.5'}`;
      }

      // Fetch dashboard statistics & data
      const res = await API.getStudentDashboardStats();
      if (res.success) {
        // Counts
        const activeCountEl = document.getElementById('stat-active-drives');
        if (activeCountEl) activeCountEl.textContent = res.stats.activeDrivesCount;
        const upcomingCountEl = document.getElementById('stat-upcoming-drives');
        if (upcomingCountEl) upcomingCountEl.textContent = res.stats.upcomingDrivesCount;
        const totalCompEl = document.getElementById('stat-total-companies');
        if (totalCompEl) totalCompEl.textContent = res.stats.totalCompanies;

        // Render Seasonal Hiring Overview Cards
        this.renderSeasonsSummary(res.seasonsSummary);

        // Render Active & Upcoming Drives
        this.renderUpcomingDrives(res.upcomingSeasonalDrives);

        // Render Recently Added Companies
        this.renderRecentCompanies(res.recentlyAddedCompanies);

        // Render Roadmaps
        this.renderRoadmaps(res.roadmaps);

        // Render Announcements
        this.renderAnnouncements(res.announcements);
      }

      // Load Student Applications if logged in
      if (user && API.getToken()) {
        await this.loadStudentApplications();
      } else {
        const myAppContainer = document.getElementById('my-applications-container');
        if (myAppContainer) {
          myAppContainer.innerHTML = `
            <div class="text-center py-4 bg-light rounded">
              <i class="bi bi-lock text-muted fs-3 d-block mb-2"></i>
              <p class="text-muted small mb-2">Please log in to view and track your job applications.</p>
              <a href="login.html" class="btn btn-primary-crp btn-sm px-4">Sign In Now</a>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error('Error loading student dashboard:', err);
      CRP.toast('Error loading dashboard: ' + err.message, 'danger');
    }
  },

  // Load and Render Student Applications
  async loadStudentApplications() {
    const container = document.getElementById('my-applications-container');
    const statBadge = document.getElementById('stat-my-applications');
    if (!container) return;

    try {
      const res = await API.getMyApplications();
      if (res.success) {
        const apps = res.applications || [];
        if (statBadge) statBadge.textContent = apps.length;

        if (apps.length === 0) {
          container.innerHTML = `
            <div class="text-center py-5 bg-light rounded">
              <i class="bi bi-briefcase text-muted fs-1 d-block mb-2 opacity-50"></i>
              <h6 class="fw-bold text-dark mb-1">No Job Applications Yet</h6>
              <p class="text-muted small mb-3">Browse upcoming campus recruitment drives below and click <strong>Apply Now</strong> to submit your application.</p>
              <a href="#upcoming-drives-container" class="btn btn-primary-crp btn-sm px-3">
                <i class="bi bi-arrow-down-circle me-1"></i> Browse Drives
              </a>
            </div>
          `;
          return;
        }

        const getStatusPill = (status) => {
          switch (status) {
            case 'Selected':
              return `<span class="badge bg-success px-3 py-2 rounded-pill"><i class="bi bi-trophy me-1"></i> Selected / Offer Made</span>`;
            case 'Shortlisted':
              return `<span class="badge bg-primary px-3 py-2 rounded-pill"><i class="bi bi-star-fill me-1"></i> Shortlisted</span>`;
            case 'Interview Scheduled':
              return `<span class="badge bg-info text-dark px-3 py-2 rounded-pill"><i class="bi bi-calendar-check me-1"></i> Interview Scheduled</span>`;
            case 'Under Review':
              return `<span class="badge bg-warning text-dark px-3 py-2 rounded-pill"><i class="bi bi-hourglass-split me-1"></i> Under Review</span>`;
            case 'Rejected':
              return `<span class="badge bg-danger px-3 py-2 rounded-pill"><i class="bi bi-x-circle me-1"></i> Not Selected</span>`;
            default:
              return `<span class="badge bg-secondary px-3 py-2 rounded-pill"><i class="bi bi-check2 me-1"></i> Application Submitted</span>`;
          }
        };

        container.innerHTML = `
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr class="small text-muted text-uppercase">
                  <th>Company & Drive</th>
                  <th>Season</th>
                  <th>Package Range</th>
                  <th>Applied On</th>
                  <th>Current Status</th>
                  <th class="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                ${apps.map((app) => `
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-3">
                        <img src="${app.company?.logo || 'https://ui-avatars.com/api/?name=Co'}" class="company-card-logo" style="width: 40px; height: 40px;" alt="Logo" onerror="this.src='https://ui-avatars.com/api/?name=Co'">
                        <div>
                          <div class="fw-bold text-dark">${app.company?.name || 'Company'}</div>
                          <div class="text-muted small">${app.drive?.title || 'Campus Drive'}</div>
                        </div>
                      </div>
                    </td>
                    <td>${CRP.getSeasonBadge(app.drive?.season)}</td>
                    <td><span class="fw-bold text-success small">${app.drive?.packageRange || 'Competitive'}</span></td>
                    <td class="text-muted small">${CRP.formatDate(app.appliedDate || app.createdAt)}</td>
                    <td>${getStatusPill(app.status)}</td>
                    <td class="text-end">
                      <div class="d-flex gap-1 justify-content-end">
                        <a href="drive-details.html?id=${app.drive?._id || app.drive}" class="btn btn-outline-primary btn-sm py-1 px-2 small" title="View Drive">
                          <i class="bi bi-eye"></i> Details
                        </a>
                        ${app.status === 'Applied' || app.status === 'Under Review' ? `
                          <button class="btn btn-outline-danger btn-sm py-1 px-2 small" onclick="StudentApp.withdrawApplication('${app._id}')" title="Withdraw Application">
                            <i class="bi bi-trash"></i>
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  },

  // Apply to a Recruitment Drive
  async applyToDrive(driveId, companyName = 'Company') {
    const user = API.getUser();
    const token = API.getToken();

    if (!token || !user) {
      CRP.toast('Please log in to apply for this campus recruitment drive.', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
      return;
    }

    if (user.role !== 'student') {
      CRP.toast('Only registered students can apply for campus drives.', 'warning');
      return;
    }

    const confirmApply = confirm(`Are you sure you want to submit your application for ${companyName}? Your profile credentials (CGPA: ${user.cgpa || '8.5'}, Department: ${user.degree || 'MCA'}) will be evaluated.`);
    if (!confirmApply) return;

    try {
      CRP.toast(`Submitting application to ${companyName}...`, 'info');
      const res = await API.applyForDrive(driveId, {
        notes: `Application submitted via Student Portal by ${user.name} (${user.student_id || user.usn || 'Student'}).`,
      });

      if (res.success) {
        CRP.toast(res.message, 'success', 'Application Received!');
        await this.loadStudentApplications();
        // If on drive details page, refresh status
        const appStatusEl = document.getElementById('student-app-status-badge');
        if (appStatusEl) {
          appStatusEl.innerHTML = `<span class="badge bg-success p-2"><i class="bi bi-check-circle-fill me-1"></i> Applied Successfully</span>`;
        }
      }
    } catch (err) {
      CRP.toast(err.message, 'danger', 'Application Error');
    }
  },

  // Withdraw Application
  async withdrawApplication(appId) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      CRP.toast('Withdrawing application...', 'info');
      const res = await API.withdrawApplication(appId);
      if (res.success) {
        CRP.toast(res.message, 'info');
        await this.loadStudentApplications();
      }
    } catch (err) {
      CRP.toast(err.message, 'danger', 'Withdraw Failed');
    }
  },

  // Render Seasonal Summary Pills
  renderSeasonsSummary(seasons) {
    const container = document.getElementById('seasonal-summary-container');
    if (!container || !seasons) return;

    container.innerHTML = seasons.map((s) => `
      <div class="col-md-3 col-6">
        <div class="season-nav-pill active-${s.quarter.toLowerCase()} h-100" onclick="window.location.href='companies.html?season=${encodeURIComponent(s.seasonName)}'">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge ${s.badgeClass} text-white">${s.quarter} Hiring</span>
            <span class="fw-bold text-dark fs-5">${s.companyCount} Cos</span>
          </div>
          <div class="fw-bold text-dark small mb-1">${s.seasonName}</div>
          <div class="text-muted" style="font-size: 0.75rem;">${s.focus}</div>
          <div class="mt-2 text-primary fw-semibold small"><i class="bi bi-arrow-right-circle me-1"></i> Explore Season</div>
        </div>
      </div>
    `).join('');
  },

  // Render Upcoming Drives
  renderUpcomingDrives(drives) {
    const container = document.getElementById('upcoming-drives-container');
    if (!container) return;

    if (!drives || drives.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-4 text-muted">
          <i class="bi bi-calendar-x fs-1 d-block mb-2 text-secondary"></i>
          No active recruitment drives scheduled currently.
        </div>
      `;
      return;
    }

    container.innerHTML = drives.map((d) => `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="crp-card h-100 d-flex flex-column">
          <div class="crp-card-body flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="d-flex align-items-center gap-3">
                <img src="${d.company?.logo || 'https://ui-avatars.com/api/?name=Company'}" alt="${d.company?.name}" class="company-card-logo" onerror="this.src='https://ui-avatars.com/api/?name=Co&background=4F46E5&color=fff'">
                <div>
                  <h6 class="fw-bold mb-0 text-dark">${d.company?.name || 'Company'}</h6>
                  <span class="tier-badge ${d.company?.tier?.includes('Super') ? 'tier-super-dream' : 'tier-dream'}">${d.company?.tier || 'Tier-1'}</span>
                </div>
              </div>
              <div>${CRP.getStatusBadge(d.status)}</div>
            </div>

            <h5 class="fw-bold text-primary mb-2" style="font-size: 1.05rem;">${d.driveTitle}</h5>

            <div class="mb-3">
              ${CRP.getSeasonBadge(d.hiringSeason)}
            </div>

            <div class="bg-light p-2 rounded mb-3 small">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted"><i class="bi bi-currency-rupee text-success"></i> Package:</span>
                <span class="fw-bold text-dark">${d.salaryRange || 'Best in Industry'}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted"><i class="bi bi-calendar-event text-primary"></i> Drive Dates:</span>
                <span class="fw-semibold text-dark">${CRP.formatDate(d.driveStartDate)} - ${CRP.formatDate(d.driveEndDate)}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted"><i class="bi bi-geo-alt text-danger"></i> Mode / Venue:</span>
                <span class="fw-semibold text-dark text-truncate" style="max-width: 170px;">${d.recruitmentMode}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted"><i class="bi bi-award text-warning"></i> Min CGPA:</span>
                <span class="badge bg-white text-dark border fw-bold">${d.minCgpa || '6.0'} CGPA</span>
              </div>
            </div>

            <div class="mb-3">
              <div class="text-muted small fw-semibold mb-1">Interview Rounds (${d.interviewRounds ? d.interviewRounds.length : 0} Stages):</div>
              <div class="d-flex gap-1 flex-wrap">
                ${(d.interviewRounds || []).map((r) => `<span class="badge bg-secondary-subtle text-secondary border small" style="font-size: 0.72rem;">R${r.roundNumber}: ${r.roundName.split(' ')[0]}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="p-3 bg-white border-top d-flex gap-2 flex-wrap">
            <a href="drive-details.html?id=${d._id}" class="btn btn-outline-crp btn-sm flex-grow-1">
              <i class="bi bi-eye me-1"></i> Details
            </a>
            <button class="btn btn-outline-secondary btn-sm px-2" onclick="StudentApp.checkEligibility('${d._id}')" title="Check your eligibility criteria">
              <i class="bi bi-patch-check"></i> Eligibility
            </button>
            <button class="btn btn-primary-crp btn-sm px-3" onclick="StudentApp.applyToDrive('${d._id}', '${(d.company?.name || 'Company').replace(/'/g, "\\'")}')">
              <i class="bi bi-send-check me-1"></i> Apply Now
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Render Recently Added Companies
  renderRecentCompanies(companies) {
    const container = document.getElementById('recent-companies-container');
    if (!container) return;

    if (!companies || companies.length === 0) {
      container.innerHTML = `<div class="col-12 text-muted">No companies listed yet.</div>`;
      return;
    }

    container.innerHTML = companies.map((c) => `
      <div class="col-lg-4 col-md-6 mb-3">
        <div class="crp-card p-3 h-100">
          <div class="d-flex align-items-center gap-3 mb-2">
            <img src="${c.logo || 'https://ui-avatars.com/api/?name=Co'}" class="company-card-logo" alt="${c.name}" onerror="this.src='https://ui-avatars.com/api/?name=Co'">
            <div>
              <h6 class="fw-bold mb-0 text-dark">${c.name}</h6>
              <div class="text-muted small">${c.industry}</div>
            </div>
          </div>
          <div class="mb-2">${CRP.getSeasonBadge(c.hiringSeason)}</div>
          <p class="text-muted small mb-3 text-truncate-2" style="font-size: 0.825rem; height: 38px; overflow: hidden;">
            ${c.description}
          </p>
          <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
            <span class="badge bg-light text-dark border small fw-bold">${c.salaryRange}</span>
            <a href="company-details.html?id=${c._id}" class="text-primary fw-semibold small">
              View Profile <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Render Roadmaps
  renderRoadmaps(roadmaps) {
    const container = document.getElementById('roadmaps-summary-container');
    if (!container) return;

    container.innerHTML = (roadmaps || []).map((r) => `
      <div class="col-md-6 mb-3">
        <div class="crp-card p-3 h-100 border-start border-primary border-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="badge bg-primary-subtle text-primary fw-semibold small">${r.category}</span>
            <span class="text-muted small"><i class="bi bi-clock me-1"></i> ${r.estimatedHours} hrs</span>
          </div>
          <h6 class="fw-bold text-dark mt-1">${r.title}</h6>
          <p class="text-muted small mb-2 text-truncate">${r.description}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted small">${r.keyTopics ? r.keyTopics.length : 0} Weeks Curriculum</span>
            <a href="skills-roadmap.html?id=${r._id}" class="text-primary fw-bold small">Study Roadmap <i class="bi bi-chevron-right"></i></a>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Render Announcements
  renderAnnouncements(notices) {
    const container = document.getElementById('announcements-container');
    if (!container) return;

    container.innerHTML = (notices || []).map((n) => `
      <div class="p-3 mb-2 rounded border-start border-4 ${n.priority === 'Urgent' ? 'border-danger bg-danger-subtle' : n.priority === 'High' ? 'border-warning bg-warning-subtle' : 'border-primary bg-light'}">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <span class="fw-bold ${n.priority === 'Urgent' ? 'text-danger' : 'text-dark'}">${n.title}</span>
          <span class="badge ${n.priority === 'Urgent' ? 'bg-danger' : n.priority === 'High' ? 'bg-warning text-dark' : 'bg-primary'}">${n.category}</span>
        </div>
        <p class="text-secondary small mb-1">${n.content}</p>
        <div class="d-flex justify-content-between align-items-center text-muted" style="font-size: 0.75rem;">
          <span><i class="bi bi-person me-1"></i> Posted by: ${n.postedByName}</span>
          <span><i class="bi bi-clock me-1"></i> ${CRP.formatDate(n.createdAt)}</span>
        </div>
      </div>
    `).join('');
  },

  // 2. Company Directory & Seasonal Filtering
  async initCompanyDirectory() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialSeason = urlParams.get('season') || 'All';
    const initialSearch = urlParams.get('search') || '';

    const seasonFilter = document.getElementById('filter-season');
    if (seasonFilter && initialSeason !== 'All') {
      seasonFilter.value = initialSeason;
    }

    const searchInput = document.getElementById('search-company-input');
    if (searchInput && initialSearch) {
      searchInput.value = initialSearch;
    }

    await this.fetchAndRenderCompanies();

    // Event listeners for filters
    const filterIds = ['filter-season', 'filter-quarter', 'filter-tier', 'filter-status', 'filter-workmode'];
    filterIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.fetchAndRenderCompanies());
      }
    });

    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this.fetchAndRenderCompanies(), 300);
      });
    }
  },

  async fetchAndRenderCompanies() {
    try {
      const search = document.getElementById('search-company-input')?.value || '';
      const season = document.getElementById('filter-season')?.value || 'All';
      const quarter = document.getElementById('filter-quarter')?.value || 'All';
      const tier = document.getElementById('filter-tier')?.value || 'All';
      const status = document.getElementById('filter-status')?.value || 'All';
      const workMode = document.getElementById('filter-workmode')?.value || 'All';

      const container = document.getElementById('company-list-grid');
      const countEl = document.getElementById('company-count-badge');
      if (container) {
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Loading Seasonal Companies...</p>
          </div>
        `;
      }

      const res = await API.getCompanies({
        search,
        season,
        quarter,
        tier,
        status,
        workMode,
      });

      if (res.success) {
        if (countEl) countEl.textContent = `${res.count} Companies Found`;

        if (res.data.length === 0) {
          container.innerHTML = `
            <div class="col-12 text-center py-5">
              <i class="bi bi-buildings fs-1 text-muted d-block mb-3"></i>
              <h5 class="fw-bold text-dark">No companies found matching your filters.</h5>
              <p class="text-muted">Try resetting search filters or changing the hiring season.</p>
              <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="StudentApp.resetCompanyFilters()">Reset Filters</button>
            </div>
          `;
          return;
        }

        container.innerHTML = res.data.map((c) => `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="crp-card h-100 d-flex flex-column">
              <div class="crp-card-body flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="d-flex align-items-center gap-3">
                    <img src="${c.logo || 'https://ui-avatars.com/api/?name=Co'}" class="company-card-logo" alt="${c.name}" onerror="this.src='https://ui-avatars.com/api/?name=Co&background=4F46E5&color=fff'">
                    <div>
                      <h6 class="fw-bold text-dark mb-0">${c.name}</h6>
                      <div class="text-muted small">${c.industry}</div>
                    </div>
                  </div>
                  <span class="tier-badge ${c.tier?.includes('Super') ? 'tier-super-dream' : 'tier-dream'}">${c.tier}</span>
                </div>

                <div class="mb-3">
                  ${CRP.getSeasonBadge(c.hiringSeason)}
                </div>

                <p class="text-muted small mb-3 text-truncate-2" style="font-size: 0.85rem; height: 42px; overflow: hidden;">
                  ${c.description}
                </p>

                <div class="bg-light p-2 rounded mb-3 small">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted"><i class="bi bi-currency-rupee text-success"></i> CTC Range:</span>
                    <span class="fw-bold text-dark">${c.salaryRange}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted"><i class="bi bi-cash-stack text-primary"></i> Monthly Stipend:</span>
                    <span class="fw-semibold text-dark">₹${(c.stipendMonthly || 0).toLocaleString()}/mo</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted"><i class="bi bi-geo-alt text-danger"></i> Location / Mode:</span>
                    <span class="fw-semibold text-dark">${c.defaultWorkMode} (${c.defaultLocation.split('/')[0]})</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted"><i class="bi bi-mortarboard text-info"></i> Eligible CGPA:</span>
                    <span class="badge bg-white text-dark border fw-bold">${c.eligibilityCriteria?.minCgpa || 7.0}+</span>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="text-muted small fw-semibold mb-1">Required Skills:</div>
                  <div class="d-flex gap-1 flex-wrap">
                    ${(c.requiredSkills || []).slice(0, 4).map((s) => `<span class="badge bg-light text-dark border" style="font-size: 0.72rem;">${s}</span>`).join('')}
                    ${c.requiredSkills && c.requiredSkills.length > 4 ? `<span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.72rem;">+${c.requiredSkills.length - 4} more</span>` : ''}
                  </div>
                </div>

                ${c.jobRoles && c.jobRoles.length > 0 ? `
                  <div class="mb-2">
                    <div class="text-muted small fw-semibold mb-1">Available Job Roles (${c.jobRoles.length}):</div>
                    <ul class="list-unstyled mb-0 small">
                      ${c.jobRoles.slice(0, 2).map((r) => `<li class="text-truncate text-dark"><i class="bi bi-check2 text-primary me-1"></i> ${r.title}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>

              <div class="p-3 bg-white border-top d-flex gap-2">
                <a href="company-details.html?id=${c._id}" class="btn btn-outline-crp btn-sm flex-grow-1">
                  <i class="bi bi-info-circle me-1"></i> Full Company Details
                </a>
              </div>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Failed to load companies: ' + err.message, 'danger');
    }
  },

  resetCompanyFilters() {
    document.getElementById('search-company-input').value = '';
    document.getElementById('filter-season').value = 'All';
    document.getElementById('filter-quarter').value = 'All';
    document.getElementById('filter-tier').value = 'All';
    document.getElementById('filter-status').value = 'All';
    document.getElementById('filter-workmode').value = 'All';
    this.fetchAndRenderCompanies();
  },

  // 3. Single Company Details Viewer
  async initCompanyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    if (!companyId) {
      CRP.toast('No company specified.', 'warning');
      window.location.href = 'companies.html';
      return;
    }

    try {
      const res = await API.getCompany(companyId);
      if (res.success) {
        const c = res.data;

        // Populate Header Info
        document.getElementById('comp-logo').src = c.logo || 'https://ui-avatars.com/api/?name=Company';
        document.getElementById('comp-name').textContent = c.name;
        document.getElementById('comp-industry').textContent = c.industry;
        document.getElementById('comp-tier').textContent = c.tier;
        document.getElementById('comp-tier').className = `tier-badge ${c.tier?.includes('Super') ? 'tier-super-dream' : 'tier-dream'}`;
        document.getElementById('comp-season-badge').innerHTML = CRP.getSeasonBadge(c.hiringSeason);
        document.getElementById('comp-website').href = c.website || '#';
        document.getElementById('comp-website').textContent = c.website ? c.website.replace('https://', '') : 'Official Site';
        document.getElementById('comp-desc').textContent = c.description;

        // Quick Stats
        document.getElementById('comp-ctc').textContent = c.salaryRange;
        document.getElementById('comp-stipend').textContent = `₹${(c.stipendMonthly || 0).toLocaleString()} / month`;
        document.getElementById('comp-location').textContent = `${c.defaultLocation} (${c.defaultWorkMode})`;
        document.getElementById('comp-vacancies').textContent = `${c.vacancies} Openings`;
        document.getElementById('comp-experience').textContent = c.experienceRequirement;
        document.getElementById('comp-status-badge').innerHTML = CRP.getStatusBadge(c.recruitmentStatus);

        // Eligibility Card
        document.getElementById('comp-elig-cgpa').textContent = `${c.eligibilityCriteria?.minCgpa || 7.0} CGPA`;
        document.getElementById('comp-elig-backlogs').textContent = `${c.eligibilityCriteria?.maxBacklogs || 0} Allowed`;
        document.getElementById('comp-elig-tenth').textContent = `${c.eligibilityCriteria?.minTenth || 60}%`;
        document.getElementById('comp-elig-twelfth').textContent = `${c.eligibilityCriteria?.minTwelfth || 60}%`;

        // Qualifications & Skills
        document.getElementById('comp-qualifications').innerHTML = (c.requiredQualifications || []).map((q) => `<span class="badge bg-primary-subtle text-primary border px-2 py-1 me-1 mb-1">${q}</span>`).join('');
        document.getElementById('comp-skills').innerHTML = (c.requiredSkills || []).map((s) => `<span class="badge bg-light text-dark border px-2 py-1 me-1 mb-1">${s}</span>`).join('');

        // Interview Rounds
        const roundsContainer = document.getElementById('comp-rounds-container');
        if (roundsContainer) {
          roundsContainer.innerHTML = (c.interviewRounds || []).map((r) => `
            <div class="round-item">
              <div class="round-dot"></div>
              <div class="crp-card p-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <h6 class="fw-bold text-dark mb-0">Round ${r.roundNumber}: ${r.name}</h6>
                  <span class="badge bg-white text-dark border">${r.mode} • ${r.duration}</span>
                </div>
                <p class="text-secondary small mb-2">${r.description}</p>
                ${r.tips ? `<div class="bg-white p-2 rounded small text-primary border"><i class="bi bi-lightbulb-fill text-warning me-1"></i> <strong>Prep Tip:</strong> ${r.tips}</div>` : ''}
              </div>
            </div>
          `).join('');
        }

        // Job Roles List
        const rolesContainer = document.getElementById('comp-job-roles-container');
        if (rolesContainer) {
          if (!c.jobRoles || c.jobRoles.length === 0) {
            rolesContainer.innerHTML = `<div class="p-3 text-muted">No specific roles detailed yet. General campus engineering position applies.</div>`;
          } else {
            rolesContainer.innerHTML = c.jobRoles.map((r) => `
              <div class="crp-card mb-3 p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="fw-bold text-primary mb-1">${r.title}</h6>
                    <span class="badge bg-secondary-subtle text-secondary small">${r.roleCategory}</span>
                  </div>
                  <span class="badge bg-success-subtle text-success border fw-bold">${r.salaryPackage?.ctcMin} - ${r.salaryPackage?.ctcMax} ${r.salaryPackage?.currency || 'LPA'}</span>
                </div>
                <p class="text-secondary small mb-2">${r.jobDescription}</p>
                <div class="row g-2 small text-muted mb-2">
                  <div class="col-sm-6"><i class="bi bi-geo-alt text-danger me-1"></i> <strong>Location:</strong> ${r.location} (${r.workMode})</div>
                  <div class="col-sm-6"><i class="bi bi-people text-primary me-1"></i> <strong>Vacancies:</strong> ${r.vacancies}</div>
                </div>
                <div class="text-muted small"><strong>Technical Skills:</strong> ${(r.technicalSkills || []).join(', ')}</div>
              </div>
            `).join('');
          }
        }

        // Active Drives
        const drivesContainer = document.getElementById('comp-active-drives-container');
        if (drivesContainer) {
          if (!c.recruitmentDrives || c.recruitmentDrives.length === 0) {
            drivesContainer.innerHTML = `<div class="p-3 text-muted">No scheduled campus drives currently live. Check seasonal recruitment window above.</div>`;
          } else {
            drivesContainer.innerHTML = c.recruitmentDrives.map((d) => `
              <div class="crp-card p-3 mb-3 border-start border-4 border-primary">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold text-dark mb-0">${d.driveTitle}</h6>
                  ${CRP.getStatusBadge(d.status)}
                </div>
                <div class="text-muted small mb-2"><i class="bi bi-calendar-event text-primary me-1"></i> ${CRP.formatDate(d.driveStartDate)} to ${CRP.formatDate(d.driveEndDate)} • Mode: ${d.recruitmentMode}</div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <span class="badge bg-light text-dark border">Min CGPA: ${d.minCgpa}</span>
                  <a href="drive-details.html?id=${d._id}" class="btn btn-primary-crp btn-sm px-3">View Drive Schedule <i class="bi bi-arrow-right"></i></a>
                </div>
              </div>
            `).join('');
          }
        }

        // Preparation Tips
        const tipsContainer = document.getElementById('comp-tips-container');
        if (tipsContainer) {
          tipsContainer.innerHTML = (c.preparationTips || []).map((tip) => `
            <li class="mb-2 d-flex align-items-start gap-2">
              <i class="bi bi-check-circle-fill text-success mt-1"></i>
              <span>${tip}</span>
            </li>
          `).join('');
        }
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading company details: ' + err.message, 'danger');
    }
  },

  // 4. Single Drive Details Viewer
  async initDriveDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const driveId = urlParams.get('id');

    if (!driveId) {
      CRP.toast('No recruitment drive specified.', 'warning');
      window.location.href = 'seasonal-calendar.html';
      return;
    }

    try {
      const res = await API.getDrive(driveId);
      if (res.success) {
        const d = res.data;

        document.getElementById('drive-title').textContent = d.driveTitle;
        document.getElementById('drive-status-badge').innerHTML = CRP.getStatusBadge(d.status);
        document.getElementById('drive-season-badge').innerHTML = CRP.getSeasonBadge(d.hiringSeason);
        document.getElementById('drive-company-logo').src = d.company?.logo || 'https://ui-avatars.com/api/?name=Company';
        document.getElementById('drive-company-name').textContent = d.company?.name || 'Company';
        document.getElementById('drive-company-tier').textContent = d.company?.tier || 'Tier-1';
        document.getElementById('drive-company-industry').textContent = d.company?.industry || 'Software';

        // Details
        document.getElementById('drive-type').textContent = d.driveType;
        document.getElementById('drive-mode').textContent = d.recruitmentMode;
        document.getElementById('drive-venue').textContent = d.recruitmentLocation;
        document.getElementById('drive-start').textContent = CRP.formatDate(d.driveStartDate);
        document.getElementById('drive-end').textContent = CRP.formatDate(d.driveEndDate);
        document.getElementById('drive-deadline').textContent = CRP.formatDateTime(d.registrationDeadline);
        document.getElementById('drive-ctc').textContent = d.salaryRange;
        document.getElementById('drive-stipend').textContent = `₹${(d.stipendMonthly || 0).toLocaleString()}/mo`;
        document.getElementById('drive-openings').textContent = `${d.totalOpenings} Positions`;

        // Eligibility Criteria
        document.getElementById('drive-elig-cgpa').textContent = `${d.minCgpa} CGPA`;
        document.getElementById('drive-elig-backlogs').textContent = `${d.maxBacklogsAllowed} Allowed`;
        document.getElementById('drive-elig-tenth').textContent = `${d.minTenth}%`;
        document.getElementById('drive-elig-twelfth').textContent = `${d.minTwelfth}%`;
        document.getElementById('drive-elig-batch').textContent = `${d.targetBatch} Batch`;
        document.getElementById('drive-elig-degrees').innerHTML = (d.eligibleDegrees || []).map((deg) => `<span class="badge bg-primary-subtle text-primary border me-1">${deg}</span>`).join('');

        // Eligible Departments
        const deptsContainer = document.getElementById('drive-elig-depts');
        if (deptsContainer) {
          if (!d.eligibleDepartments || d.eligibleDepartments.length === 0) {
            deptsContainer.innerHTML = `<span class="badge bg-success">All College Departments Eligible</span>`;
          } else {
            deptsContainer.innerHTML = d.eligibleDepartments.map((dept) => `<span class="badge bg-secondary-subtle text-secondary border me-1">${dept.name} (${dept.code})</span>`).join('');
          }
        }

        // Rounds Timeline
        const roundsContainer = document.getElementById('drive-rounds-timeline');
        if (roundsContainer) {
          roundsContainer.innerHTML = (d.interviewRounds || []).map((r) => `
            <div class="round-item">
              <div class="round-dot"></div>
              <div class="crp-card p-3 mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <h6 class="fw-bold text-dark mb-0">Stage ${r.roundNumber}: ${r.roundName}</h6>
                  <span class="badge bg-primary-subtle text-primary border">${r.mode} • ${r.duration}</span>
                </div>
                <div class="text-muted small mb-2"><i class="bi bi-clock me-1"></i> Scheduled: ${CRP.formatDateTime(r.scheduledDate)}</div>
                <p class="text-secondary small mb-2">${r.description}</p>
                <div class="d-flex justify-content-between align-items-center small text-muted border-top pt-2">
                  <span><strong>Topics:</strong> ${(r.topicsCovered || []).join(', ') || 'General CS'}</span>
                  <span><strong>Passing:</strong> ${r.passingCriteria}</span>
                </div>
              </div>
            </div>
          `).join('');
        }

        // Instructions
        document.getElementById('drive-instructions').textContent = d.instructionsForStudents;

        // Button to check student's eligibility
        const checkBtn = document.getElementById('btn-check-my-eligibility');
        if (checkBtn) {
          checkBtn.onclick = () => this.checkEligibility(d._id);
        }
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Failed to load drive details: ' + err.message, 'danger');
    }
  },

  // 5. Interactive Eligibility Verification Modal
  async checkEligibility(driveId) {
    const user = API.getUser();
    if (!user) {
      CRP.toast('Please log in with your Student account to verify eligibility.', 'warning');
      setTimeout(() => { window.location.href = 'student-login.html'; }, 1000);
      return;
    }

    try {
      CRP.toast('Verifying academic profile against company criteria...', 'info');
      const res = await API.checkStudentEligibility(driveId);

      if (res.success) {
        let modalEl = document.getElementById('crp-eligibility-modal');
        if (!modalEl) {
          const modalHtml = `
            <div class="modal fade" id="crp-eligibility-modal" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title fw-bold" id="elig-modal-title"><i class="bi bi-patch-check-fill text-primary me-2"></i> Eligibility Verification</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body" id="elig-modal-body">
                    <!-- Dynamic Body -->
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                    <a href="skills-roadmap.html" class="btn btn-primary-crp btn-sm"><i class="bi bi-mortarboard me-1"></i> View Preparation Roadmap</a>
                  </div>
                </div>
              </div>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', modalHtml);
          modalEl = document.getElementById('crp-eligibility-modal');
        }

        const bodyEl = document.getElementById('elig-modal-body');
        const isElig = res.isEligible;

        bodyEl.innerHTML = `
          <div class="text-center mb-3">
            <div class="display-5 mb-2">${isElig ? '🎉' : '⚠️'}</div>
            <h4 class="fw-bold ${isElig ? 'text-success' : 'text-danger'}">
              ${isElig ? 'You Are Eligible!' : 'Eligibility Criteria Mismatch'}
            </h4>
            <p class="text-muted small">
              Evaluation for <strong>${res.driveRequirements.title} (${res.driveRequirements.company})</strong>
            </p>
          </div>

          <div class="bg-light p-3 rounded mb-3 small">
            <h6 class="fw-bold text-dark border-bottom pb-2 mb-2">Your Profile Summary:</h6>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Student Name:</span>
              <span class="fw-bold text-dark">${res.studentDetails.name} (${res.studentDetails.usn || 'MCA'})</span>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Your CGPA:</span>
              <span class="fw-bold text-dark">${res.studentDetails.cgpa} (Required: ${res.driveRequirements.minCgpa}+)</span>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Active Backlogs:</span>
              <span class="fw-bold text-dark">${res.studentDetails.backlogs} (Max Allowed: ${res.driveRequirements.maxBacklogs})</span>
            </div>
          </div>

          ${isElig ? `
            <div class="alert alert-success d-flex align-items-center gap-2 small">
              <i class="bi bi-check-circle-fill fs-5"></i>
              <div>
                <strong>Congratulations!</strong> You meet all academic eligibility conditions for this drive. Review the interview rounds and begin your roadmap preparation!
              </div>
            </div>
          ` : `
            <div class="alert alert-danger small">
              <strong>Specific Criteria Gap(s):</strong>
              <ul class="mb-0 mt-1 ps-3">
                ${res.reasons.map((r) => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          `}
        `;

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch (err) {
      CRP.toast('Eligibility check failed: ' + err.message, 'danger');
    }
  },

  // 6. Interactive Seasonal Calendar Viewer
  async initSeasonalCalendar() {
    try {
      const res = await API.getSeasonalCalendar();
      if (res.success) {
        const events = res.data;
        const container = document.getElementById('calendar-events-timeline');
        const countEl = document.getElementById('calendar-events-count');

        if (countEl) countEl.textContent = `${events.length} Scheduled Recruitment Events`;

        if (container) {
          if (events.length === 0) {
            container.innerHTML = `<div class="text-muted text-center py-5">No calendar events available.</div>`;
            return;
          }

          container.innerHTML = events.map((ev) => `
            <div class="crp-card mb-3 p-3 border-start border-4 ${ev.hiringSeason?.includes('January') ? 'border-primary' : ev.hiringSeason?.includes('April') ? 'border-success' : ev.hiringSeason?.includes('July') ? 'border-purple' : 'border-warning'}">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge ${ev.type === 'round' ? 'bg-info-subtle text-info border' : 'bg-primary-subtle text-primary border'} small mb-1">
                    ${ev.type === 'round' ? `Round ${ev.roundNumber} Assessment` : 'Full Campus Drive'}
                  </span>
                  <h6 class="fw-bold text-dark mb-0">${ev.title}</h6>
                </div>
                ${CRP.getSeasonBadge(ev.hiringSeason)}
              </div>

              <div class="row g-2 text-muted small my-2">
                <div class="col-sm-6"><i class="bi bi-calendar-check text-primary me-1"></i> <strong>Date:</strong> ${CRP.formatDate(ev.start)}</div>
                <div class="col-sm-6"><i class="bi bi-broadcast text-success me-1"></i> <strong>Mode:</strong> ${ev.recruitmentMode}</div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                <span class="small text-muted">${ev.salaryRange ? `Package: <strong>${ev.salaryRange}</strong>` : ''}</span>
                <a href="drive-details.html?id=${ev.driveId}" class="btn btn-outline-crp btn-xs py-1 px-3">
                  View Drive Details <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading seasonal calendar: ' + err.message, 'danger');
    }
  },

  // 7. Skills & Roadmap Viewer
  async initRoadmaps() {
    try {
      const res = await API.getRoadmaps();
      if (res.success) {
        const roadmaps = res.data;
        const container = document.getElementById('roadmaps-grid');
        if (!container) return;

        container.innerHTML = roadmaps.map((r) => `
          <div class="col-lg-6 mb-4">
            <div class="crp-card h-100 d-flex flex-column">
              <div class="crp-card-body flex-grow-1">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge bg-primary-subtle text-primary border">${r.category}</span>
                  <span class="text-muted small"><i class="bi bi-clock me-1"></i> ${r.estimatedHours} Hours</span>
                </div>
                <h5 class="fw-bold text-dark mb-2">${r.title}</h5>
                <p class="text-secondary small mb-3">${r.description}</p>
                <div class="mb-3">
                  <span class="badge bg-light text-dark border"><i class="bi bi-bullseye text-danger me-1"></i> Targeted Season: ${r.targetSeason}</span>
                </div>

                <!-- Week Topics Accordion -->
                <h6 class="fw-bold text-dark small mb-2"><i class="bi bi-journal-code text-primary me-1"></i> Weekly Syllabus (${r.keyTopics ? r.keyTopics.length : 0} Weeks):</h6>
                <div class="accordion accordion-flush mb-3" id="acc-${r._id}">
                  ${(r.keyTopics || []).map((t, idx) => `
                    <div class="accordion-item border rounded mb-1">
                      <h2 class="accordion-header">
                        <button class="accordion-button collapsed py-2 small fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${r._id}-${idx}">
                          Week ${t.weekNumber}: ${t.topicName}
                        </button>
                      </h2>
                      <div id="collapse-${r._id}-${idx}" class="accordion-collapse collapse" data-bs-parent="#acc-${r._id}">
                        <div class="accordion-body small text-secondary py-2">
                          <p class="mb-1">${t.details}</p>
                          ${t.mustSolveProblems && t.mustSolveProblems.length > 0 ? `
                            <div class="fw-semibold text-dark mt-1">Must-Solve Problems:</div>
                            <div class="d-flex gap-1 flex-wrap mt-1">
                              ${t.mustSolveProblems.map((p) => `<span class="badge bg-white text-dark border">${p}</span>`).join('')}
                            </div>
                          ` : ''}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Common Interview Questions -->
                ${r.commonInterviewQuestions && r.commonInterviewQuestions.length > 0 ? `
                  <h6 class="fw-bold text-dark small mb-2"><i class="bi bi-question-circle text-warning me-1"></i> Real Interview Questions:</h6>
                  <div class="bg-light p-2 rounded mb-3 small">
                    ${r.commonInterviewQuestions.map((q) => `
                      <div class="mb-2 pb-2 border-bottom last-no-border">
                        <div class="fw-semibold text-dark">Q: ${q.question}</div>
                        <div class="text-secondary mt-1"><i class="bi bi-lightbulb text-primary me-1"></i> <strong>Answer Outline:</strong> ${q.answerTip}</div>
                        <div class="text-muted mt-1" style="font-size: 0.72rem;">Asked in: ${(q.frequentCompanies || []).join(', ')}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                <!-- Recommended Resources -->
                ${r.recommendedResources && r.recommendedResources.length > 0 ? `
                  <div class="text-muted small fw-semibold mb-1">Free Practice Resources:</div>
                  <div class="d-flex gap-2 flex-wrap">
                    ${r.recommendedResources.map((resItem) => `
                      <a href="${resItem.url}" target="_blank" class="badge bg-white text-primary border text-decoration-none py-1 px-2">
                        <i class="bi bi-box-arrow-up-right me-1"></i> ${resItem.title} (${resItem.resourceType})
                      </a>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading skill roadmaps: ' + err.message, 'danger');
    }
  },

  // Enhanced Cyclic Seasonal Calendar Viewer
  async initEnhancedSeasonalCalendar() {
    try {
      const container = document.getElementById('calendar-grid-container');
      const countBadge = document.getElementById('calendar-total-count');

      // Fetch full 12-month calendar from API
      const res = await API.getCyclicCalendar();
      if (!res.success) throw new Error(res.message);

      const calendarData = res.data;
      window._cyclicCalendarData = calendarData;
      window._selectedMonth = 'All';

      // Setup Month Ribbon Click Events
      const ribbon = document.getElementById('month-ribbon');
      if (ribbon) {
        ribbon.querySelectorAll('.month-pill').forEach((pill) => {
          pill.addEventListener('click', (e) => {
            ribbon.querySelectorAll('.month-pill').forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            window._selectedMonth = pill.getAttribute('data-month');
            this.renderFilteredCalendar();
          });
        });
      }

      // Setup Search and Dropdown Filter Event Listeners
      const searchInput = document.getElementById('calendar-search-input');
      const quarterSelect = document.getElementById('calendar-filter-quarter');
      const statusSelect = document.getElementById('calendar-filter-status');
      const yearSelect = document.getElementById('calendar-filter-year');

      [quarterSelect, statusSelect, yearSelect].forEach((el) => {
        if (el) el.addEventListener('change', () => this.renderFilteredCalendar());
      });

      if (searchInput) {
        let timer;
        searchInput.addEventListener('input', () => {
          clearTimeout(timer);
          timer = setTimeout(() => this.renderFilteredCalendar(), 250);
        });
      }

      this.renderFilteredCalendar();
    } catch (err) {
      console.error(err);
      CRP.toast('Error loading seasonal calendar: ' + err.message, 'danger');
    }
  },

  renderFilteredCalendar() {
    const calendarData = window._cyclicCalendarData || {};
    const selectedMonth = window._selectedMonth || 'All';
    const searchQuery = (document.getElementById('calendar-search-input')?.value || '').toLowerCase().trim();
    const selectedQuarter = document.getElementById('calendar-filter-quarter')?.value || 'All';
    const selectedStatus = document.getElementById('calendar-filter-status')?.value || 'All';
    const selectedYear = document.getElementById('calendar-filter-year')?.value || 'All';

    const container = document.getElementById('calendar-grid-container');
    const countBadge = document.getElementById('calendar-total-count');
    if (!container) return;

    let matches = [];
    Object.keys(calendarData).forEach((monthName) => {
      if (selectedMonth !== 'All' && selectedMonth !== monthName) return;

      const monthObj = calendarData[monthName];
      if (selectedQuarter !== 'All' && monthObj.quarter !== selectedQuarter) return;

      monthObj.companies.forEach((comp) => {
        if (selectedStatus !== 'All' && comp.scheduleType !== selectedStatus) return;

        if (selectedYear !== 'All') {
          const yr = Number(selectedYear);
          if (comp.allowedAcademicYears && comp.allowedAcademicYears.length > 0 && !comp.allowedAcademicYears.includes(yr)) {
            return;
          }
        }

        if (searchQuery) {
          const matchName = comp.name?.toLowerCase().includes(searchQuery);
          const matchInd = comp.industry?.toLowerCase().includes(searchQuery);
          const matchRoles = (comp.allowedDegrees || []).some(d => d.toLowerCase().includes(searchQuery));
          if (!matchName && !matchInd && !matchRoles) return;
        }

        matches.push({
          ...comp,
          hiringMonth: monthName,
          quarter: monthObj.quarter,
        });
      });
    });

    if (countBadge) countBadge.textContent = `${matches.length} Scheduled & Predicted Opportunities`;

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
          <h5 class="fw-bold text-dark">No recruitment drives found matching your criteria.</h5>
          <p class="text-muted small">Try selecting "All Months" or clearing the filters above.</p>
          <button class="btn btn-outline-primary btn-sm rounded-pill px-4" onclick="StudentApp.resetCalendarFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = matches.map((c) => {
      const isConfirmed = c.scheduleType === 'Confirmed';
      const statusBadge = isConfirmed
        ? `<span class="badge badge-confirmed px-2 py-1"><i class="bi bi-check-circle-fill me-1"></i> Confirmed (Official)</span>`
        : `<span class="badge badge-estimated px-2 py-1"><i class="bi bi-clock-history me-1"></i> Estimated (${c.totalHistoricalVisits || 4}-Yr Pattern)</span>`;

      return `
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="crp-card h-100 d-flex flex-column shadow-sm border-0">
            <div class="crp-card-body flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="d-flex align-items-center gap-2">
                  <img src="${c.logo || 'https://ui-avatars.com/api/?name=Co'}" class="company-card-logo" style="width: 48px; height: 48px;" alt="${c.name}" onerror="this.src='https://ui-avatars.com/api/?name=Co&background=4F46E5&color=fff'">
                  <div>
                    <h6 class="fw-bold text-dark mb-0">${c.name}</h6>
                    <div class="text-muted small">${c.industry}</div>
                  </div>
                </div>
                <span class="tier-badge ${c.tier?.includes('Super') ? 'tier-super-dream' : 'tier-dream'}" style="font-size: 0.7rem;">${c.tier}</span>
              </div>

              <div class="d-flex gap-2 align-items-center mb-2 flex-wrap">
                <span class="badge bg-primary-subtle text-primary border px-2 py-1 small fw-bold">
                  <i class="bi bi-calendar-event me-1"></i> ${c.hiringMonth} (${c.quarter})
                </span>
                ${statusBadge}
              </div>

              <p class="text-secondary small mb-3" style="font-size: 0.82rem; height: 38px; overflow: hidden;">
                <i class="bi bi-graph-up-arrow text-primary me-1"></i> <strong>Recurrence Pattern:</strong> ${c.observedPattern || `Consistently recruits in ${c.hiringMonth}.`}
              </p>

              <div class="bg-light p-2 rounded mb-3 small">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted"><i class="bi bi-currency-rupee text-success"></i> CTC Package:</span>
                  <span class="fw-bold text-dark">${c.salaryRange}</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted"><i class="bi bi-mortarboard text-info"></i> Minimum CGPA:</span>
                  <span class="fw-bold text-dark">${c.minCgpa || 6.5}+ (0 Backlogs)</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted"><i class="bi bi-person-workspace text-purple"></i> Eligible Years:</span>
                  <span class="fw-semibold text-dark">${(c.allowedAcademicYears || [3, 4]).map(y => y + (y===1?'st':y===2?'nd':y===3?'rd':'th')).join(', ')} Year</span>
                </div>
              </div>
            </div>

            <div class="p-3 bg-white border-top d-flex gap-2">
              <button class="btn btn-primary-crp btn-sm flex-grow-1" onclick="StudentApp.checkEligibility('${c.id}')">
                <i class="bi bi-shield-check me-1"></i> Check Eligibility
              </button>
              <a href="company-details.html?id=${c.id}" class="btn btn-outline-secondary btn-sm" title="View Company Profile & History">
                <i class="bi bi-eye"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  resetCalendarFilters() {
    window._selectedMonth = 'All';
    const ribbon = document.getElementById('month-ribbon');
    if (ribbon) {
      ribbon.querySelectorAll('.month-pill').forEach((p) => p.classList.remove('active'));
      ribbon.querySelector('[data-month="All"]')?.classList.add('active');
    }
    const searchInput = document.getElementById('calendar-search-input');
    if (searchInput) searchInput.value = '';
    const quarterSelect = document.getElementById('calendar-filter-quarter');
    if (quarterSelect) quarterSelect.value = 'All';
    const statusSelect = document.getElementById('calendar-filter-status');
    if (statusSelect) statusSelect.value = 'All';
    const yearSelect = document.getElementById('calendar-filter-year');
    if (yearSelect) yearSelect.value = 'All';

    this.renderFilteredCalendar();
  },

  // Enhanced Company Details with Historical Table and Automated Diagnostics
  async initEnhancedCompanyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    if (!companyId) {
      CRP.toast('No company specified.', 'warning');
      window.location.href = 'companies.html';
      return;
    }
    window._currentCompanyId = companyId;

    await this.initCompanyDetails();

    try {
      const histRes = await API.getCompanyHistoricalAnalysis(companyId);
      if (histRes.success) {
        const analysis = histRes.analysis;

        const schedEl = document.getElementById('comp-schedule-badge');
        if (schedEl) {
          if (analysis.isConfirmed) {
            schedEl.className = 'badge badge-confirmed px-2 py-1';
            schedEl.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Confirmed (Official Schedule)';
          } else {
            schedEl.className = 'badge badge-estimated px-2 py-1';
            schedEl.innerHTML = `<i class="bi bi-clock-history me-1"></i> Estimated (${analysis.totalVisits || 4}-Year Pattern)`;
          }
        }

        const cycleEl = document.getElementById('comp-expected-cycle');
        if (cycleEl) {
          cycleEl.textContent = `${analysis.topHiringMonth || 'September'} (${analysis.topSeasonQuarter || 'Q3'})`;
        }

        const patternEl = document.getElementById('observed-pattern-text');
        if (patternEl) {
          patternEl.textContent = analysis.observedPattern || 'Recruitment cycle recurs during this season based on past visit records.';
        }

        const visitsBadge = document.getElementById('historical-visits-badge');
        if (visitsBadge) {
          visitsBadge.textContent = `${analysis.totalVisits} Recorded Campus Drives`;
        }

        const tbody = document.getElementById('historical-records-tbody');
        if (tbody) {
          const records = analysis.historyRecords || [];
          if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-3 text-muted">No past recruitment records logged for this company yet.</td></tr>`;
          } else {
            tbody.innerHTML = records.map((r) => `
              <tr>
                <td><span class="badge bg-secondary-subtle text-secondary fw-bold">${r.academicYear}</span></td>
                <td><strong class="text-dark">${r.hiringMonth} ${r.recruitmentYear}</strong></td>
                <td><span class="badge bg-primary-subtle text-primary">${r.seasonQuarter || 'Q3'}</span></td>
                <td class="small text-dark">${(r.jobRolesOffered || []).join(', ') || 'Software Engineer'}</td>
                <td class="fw-bold text-success">${r.salaryPackage || '5 - 8 LPA'}</td>
                <td><span class="badge bg-success-subtle text-success fw-bold">${r.studentsSelected || 0} Placed</span></td>
                <td>${r.minCgpaRequired || 6.5}</td>
                <td>${r.maxArrearsAllowed || 0}</td>
              </tr>
            `).join('');
          }
        }
      }
    } catch (histErr) {
      console.warn('Historical analysis not available for company:', histErr.message);
    }

    await this.recheckEligibility();
    this.updateBookmarkButtonState();
  },

  async recheckEligibility() {
    const box = document.getElementById('eligibility-result-box');
    if (!box) return;

    const user = API.getUser();
    if (!user) {
      box.innerHTML = `
        <div class="alert alert-secondary d-flex justify-content-between align-items-center mb-0 py-2">
          <span><i class="bi bi-info-circle me-2"></i> Log in as a Student to view real-time eligibility status against this company's cutoffs.</span>
          <a href="student-login.html" class="btn btn-primary-crp btn-sm px-3">Student Login</a>
        </div>
      `;
      return;
    }

    const companyId = window._currentCompanyId;
    try {
      const res = await API.checkEligibility(companyId);
      if (res.success) {
        const isElig = res.isEligible;
        box.innerHTML = `
          <div class="alert ${isElig ? 'alert-success' : 'alert-danger'} mb-2 border-0 shadow-sm">
            <div class="d-flex align-items-start gap-3">
              <i class="bi ${isElig ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} fs-3"></i>
              <div class="flex-grow-1">
                <h6 class="fw-bold mb-1 ${isElig ? 'text-success' : 'text-danger'}">
                  ${isElig ? 'Eligible: You meet the currently configured eligibility criteria.' : res.statusMessage}
                </h6>
                <div class="small ${isElig ? 'text-success text-opacity-75' : 'text-danger text-opacity-75'}">
                  Evaluation for <strong>${res.studentDetails.name}</strong> (${res.studentDetails.usn || 'Student'} • Year ${res.studentDetails.academicYear || 4} • CGPA: ${res.studentDetails.cgpa} • Arrears: ${res.studentDetails.arrears})
                </div>
                ${!isElig && res.reasons.length > 1 ? `
                  <ul class="mb-0 mt-2 small ps-3">
                    ${res.reasons.map(r => `<li>${r}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            </div>
          </div>
          ${res.suggestions && res.suggestions.length > 0 ? `
            <div class="p-2 bg-light rounded small text-secondary">
              <strong class="text-dark"><i class="bi bi-lightbulb text-warning me-1"></i> Recommendation:</strong>
              ${res.suggestions.join(' ')}
            </div>
          ` : ''}
        `;
      }
    } catch (err) {
      box.innerHTML = `<div class="text-danger small">Eligibility check error: ${err.message}</div>`;
    }
  },

  async updateBookmarkButtonState() {
    const btn = document.getElementById('btn-bookmark-company');
    const icon = document.getElementById('bookmark-icon');
    const text = document.getElementById('bookmark-text');
    if (!btn) return;

    try {
      const res = await API.getMyBookmarks();
      if (res.success) {
        const bookmarks = res.data || [];
        const isBookmarked = bookmarks.some(b => (b._id || b) === window._currentCompanyId);
        if (isBookmarked) {
          btn.className = 'btn btn-warning btn-sm rounded-pill px-3 shadow-sm';
          if (icon) icon.className = 'bi bi-star-fill me-1';
          if (text) text.textContent = 'Tracked in Wishlist';
        } else {
          btn.className = 'btn btn-outline-warning btn-sm rounded-pill px-3 shadow-sm';
          if (icon) icon.className = 'bi bi-star me-1';
          if (text) text.textContent = 'Track Company';
        }
      }
    } catch (err) {}
  },

  async toggleCompanyBookmark() {
    const companyId = window._currentCompanyId;
    if (!companyId) return;

    const user = API.getUser();
    if (!user) {
      CRP.toast('Please log in with your student account to track companies.', 'warning');
      return;
    }

    try {
      const res = await API.toggleBookmark(companyId);
      if (res.success) {
        CRP.toast(res.message, 'success');
        this.updateBookmarkButtonState();
      }
    } catch (err) {
      CRP.toast('Bookmark failed: ' + err.message, 'danger');
    }
  },
};
