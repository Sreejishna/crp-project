// Auth Module Logic for Student, Admin, and Department logins/registration
const Auth = {
  // Handle Student Registration
  async handleStudentRegister(e) {
    e.preventDefault();
    try {
      const name = document.getElementById('reg-name')?.value?.trim();
      const email = document.getElementById('reg-email')?.value?.trim();
      const password = document.getElementById('reg-password')?.value;
      const confirmPassword = document.getElementById('reg-confirm-password')?.value;
      const student_id = (document.getElementById('reg-student-id')?.value || document.getElementById('reg-usn')?.value || '').trim();
      const phone = document.getElementById('reg-phone')?.value?.trim() || '';
      const departmentId = document.getElementById('reg-department')?.value || '';
      const degree = document.getElementById('reg-degree')?.value || 'MCA';
      const batchYear = document.getElementById('reg-batch')?.value || '2026';
      const cgpa = document.getElementById('reg-cgpa')?.value || '0';
      const tenthPercentage = document.getElementById('reg-tenth')?.value || '0';
      const twelfthPercentage = document.getElementById('reg-twelfth')?.value || '0';
      const activeBacklogs = document.getElementById('reg-backlogs')?.value || '0';
      const skills = document.getElementById('reg-skills')?.value || '';

      if (!name) throw new Error('Full Name is required.');
      if (!student_id) throw new Error('Student ID is required.');
      if (!email) throw new Error('Email address is required.');
      if (!password) throw new Error('Password is required.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      if (confirmPassword && password !== confirmPassword) {
        throw new Error('Passwords do not match. Please re-enter.');
      }

      CRP.toast('Creating your student profile...', 'info');

      const res = await API.registerStudent({
        name,
        email,
        password,
        confirmPassword,
        student_id,
        usn: student_id,
        phone,
        departmentId: departmentId || undefined,
        degree,
        batchYear,
        cgpa,
        tenthPercentage,
        twelfthPercentage,
        activeBacklogs,
        skills,
      });

      if (res.success) {
        API.setToken(res.token);
        API.setUser(res.user);
        CRP.toast(res.message, 'success');
        setTimeout(() => {
          window.location.href = 'student-dashboard.html';
        }, 800);
      }
    } catch (err) {
      CRP.toast(err.message, 'danger', 'Registration Failed');
    }
  },

  // Handle Login
  async handleLogin(e, expectedRole = '') {
    e.preventDefault();
    try {
      const email = document.getElementById('login-email')?.value?.trim();
      const password = document.getElementById('login-password')?.value;

      if (!email || !password) {
        throw new Error('Please enter both your email and password.');
      }

      CRP.toast('Authenticating credentials...', 'info');

      const res = await API.login(email, password, expectedRole);

      if (res.success) {
        API.setToken(res.token);
        API.setUser(res.user);
        CRP.toast(res.message, 'success');

        setTimeout(() => {
          if (res.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else if (res.user.role === 'department') {
            window.location.href = 'department-dashboard.html';
          } else {
            window.location.href = 'student-dashboard.html';
          }
        }, 600);
      }
    } catch (err) {
      CRP.toast(err.message, 'danger', 'Login Failed');
    }
  },

  // Handle Forgot Password
  async handleForgotPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('forgot-email')?.value?.trim() || prompt('Enter your registered email address for password reset:');
    if (!email) return;

    try {
      CRP.toast('Processing password reset request...', 'info');
      const res = await API.forgotPassword(email);
      if (res.success) {
        CRP.toast(res.message, 'success', 'Password Reset Request');
        const modalEl = document.getElementById('forgotPasswordModal');
        if (modalEl && window.bootstrap) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
      }
    } catch (err) {
      CRP.toast(err.message, 'danger', 'Reset Failed');
    }
  },

  // Load Department Dropdown Options in Registration Form
  async loadDepartmentsIntoSelect(selectId) {
    try {
      const select = document.getElementById(selectId);
      if (!select) return;

      const res = await API.getDepartments();
      if (res.success) {
        select.innerHTML = `
          <option value="">-- Select Your Department --</option>
          ${res.data.map((d) => `<option value="${d._id}">${d.name} (${d.code})</option>`).join('')}
        `;
      }
    } catch (err) {
      console.error(err);
    }
  },

  // Initialize Student Profile Page
  async initProfile() {
    try {
      const user = API.getUser();
      if (!user) {
        window.location.href = 'student-login.html';
        return;
      }

      const res = await API.getMe();
      if (res.success) {
        const u = res.user;

        document.getElementById('profile-name').value = u.name;
        document.getElementById('profile-email').value = u.email;
        document.getElementById('profile-usn').value = u.usn || 'N/A';
        document.getElementById('profile-degree').value = u.degree || 'MCA';
        const yearEl = document.getElementById('profile-academic-year');
        if (yearEl) yearEl.value = u.academicYear || 4;
        document.getElementById('profile-dept').value = u.department?.name || 'Assigned Department';
        document.getElementById('profile-cgpa').value = u.cgpa;
        document.getElementById('profile-tenth').value = u.tenthPercentage;
        document.getElementById('profile-twelfth').value = u.twelfthPercentage;
        const diplomaEl = document.getElementById('profile-diploma');
        if (diplomaEl) diplomaEl.value = u.diplomaPercentage || 0;
        document.getElementById('profile-backlogs').value = u.arrears !== undefined ? u.arrears : (u.activeBacklogs || 0);
        document.getElementById('profile-phone').value = u.phone || '';
        document.getElementById('profile-skills').value = (u.skills || []).join(', ');
        document.getElementById('profile-bio').value = u.bio || '';

        // Status Card
        document.getElementById('profile-card-name').textContent = u.name;
        document.getElementById('profile-card-usn').textContent = `${u.usn || 'MCA'} • Year ${u.academicYear || 4}`;
        document.getElementById('profile-card-cgpa').textContent = `${u.cgpa} CGPA`;
        document.getElementById('profile-card-placement').innerHTML = u.isPlaced
          ? `<span class="badge bg-success-subtle text-success border">Placed @ ${u.placedCompany} (${u.placedPackage} LPA)</span>`
          : `<span class="badge bg-primary-subtle text-primary border">Actively Seeking Opportunities</span>`;
      }

      const form = document.getElementById('student-profile-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          try {
            const updated = {
              name: document.getElementById('profile-name').value,
              phone: document.getElementById('profile-phone').value,
              degree: document.getElementById('profile-degree').value,
              academicYear: Number(document.getElementById('profile-academic-year')?.value || 4),
              cgpa: Number(document.getElementById('profile-cgpa').value),
              tenthPercentage: Number(document.getElementById('profile-tenth').value),
              twelfthPercentage: Number(document.getElementById('profile-twelfth').value),
              diplomaPercentage: Number(document.getElementById('profile-diploma')?.value || 0),
              activeBacklogs: Number(document.getElementById('profile-backlogs').value),
              arrears: Number(document.getElementById('profile-backlogs').value),
              skills: document.getElementById('profile-skills').value,
              bio: document.getElementById('profile-bio').value,
            };

            const updateRes = await API.updateProfile(updated);
            if (updateRes.success) {
              API.setUser(updateRes.user);
              CRP.toast('Profile updated successfully!', 'success');
              await Auth.initProfile();
            }
          } catch (err) {
            CRP.toast('Profile update failed: ' + err.message, 'danger');
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  },
};
