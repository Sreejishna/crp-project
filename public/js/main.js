/**
 * Cyclic Recruitment Portal (CRP) - Frontend Client Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap Tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Auto-dismiss alerts after 6 seconds
  const autoAlerts = document.querySelectorAll('.alert-dismissible');
  autoAlerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 6000);
  });
});

/**
 * 1-Click Demo Login Credentials Helper
 * Fills email, password, and selects the role tab
 */
function fillDemoLogin(email, password, role) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const roleInput = document.getElementById('expectedRole');

  if (emailInput && passwordInput) {
    emailInput.value = email;
    passwordInput.value = password;
    if (roleInput) roleInput.value = role;

    // Highlight form with subtle pulse
    const form = document.getElementById('loginForm');
    if (form) {
      form.classList.add('border-primary');
      setTimeout(() => form.classList.remove('border-primary'), 1000);
    }
  }
}

/**
 * Confirm Action helper for delete forms
 */
function confirmDelete(message) {
  return confirm(message || 'Are you sure you want to delete this record? This action cannot be undone.');
}
