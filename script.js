/**
 * HOTELIER — script.js
 * Hotel Management System — Client-side interactions
 * Covers: Modal Manager, Auth, Validation, Booking, Facilities,
 *         Staff Workspace, Shift Schedule, Reports, Billing & Review
 */

'use strict';

/* ============================================================
   0. GLOBAL STATE
   ============================================================ */
const state = {
  currentUser: null,       // { name, email, role }
  activeModal: null,       // ID of currently open modal
  booking: {               // Last confirmed booking data (for invoice)
    guestName: '',
    guestEmail: '',
    roomType: '',
    roomLabel: '',
    checkin: '',
    checkout: '',
    nights: 0,
    rate: 0,
    total: 0,
    facilities: []
  },
  selectedFacilities: {},  // { facilityKey: priceNumber }
  starRating: 0            // 1–5 overall rating
};

/* ============================================================
   1. DOM HELPERS
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function show(el)  { el && el.classList.remove('hidden'); }
function hide(el)  { el && el.classList.add('hidden'); }
function toggle(el, condition) { condition ? show(el) : hide(el); }

/* ============================================================
   2. MODAL MANAGER
   ============================================================ */
const overlay = $('#modal-overlay');

/**
 * Open a modal card by its element ID.
 * @param {string} modalId - The id of the .modal-card element
 */
function openModal(modalId) {
  // Close any currently open modal first
  if (state.activeModal) closeModal(false);

  const modal = $(`#${modalId}`);
  if (!modal) return;

  show(overlay);
  show(modal);
  overlay.setAttribute('aria-hidden', 'false');

  // Slight delay so CSS transition plays
  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('visible'));
  });

  state.activeModal = modalId;
  document.body.style.overflow = 'hidden';

  // Focus first focusable element inside modal
  const firstFocusable = modal.querySelector('input, select, button, textarea, [tabindex="0"]');
  if (firstFocusable) firstFocusable.focus();
}

/**
 * Close the currently open modal.
 * @param {boolean} resetOverlay - Whether to hide overlay (default true)
 */
function closeModal(resetOverlay = true) {
  if (!state.activeModal) return;

  const modal = $(`#${state.activeModal}`);
  if (modal) {
    modal.classList.remove('visible');
    setTimeout(() => hide(modal), 280);  // Match CSS transition duration
  }

  if (resetOverlay) {
    hide(overlay);
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  state.activeModal = null;
}

// Close on backdrop click
overlay.addEventListener('click', () => closeModal());

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.activeModal) closeModal();
});

// Wire all .modal-close buttons
$$('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal());
});

/* ============================================================
   3. NAVIGATION & ROLE-BASED NAV LINKS
   ============================================================ */
const NAV_LINKS = {
  guest: [
    { label: '🛏 Book a Room',   modal: 'modal-guest-booking' },
    { label: '🧾 Billing',        modal: 'modal-billing' }
  ],
  staff: [
    { label: '🗝 Room Status',   modal: 'modal-staff-workspace' },
    { label: '📅 Shift Schedule', modal: 'modal-shift-schedule' },
    { label: '🧾 Billing',        modal: 'modal-billing' }
  ],
  admin: [
    { label: '🗝 Room Status',   modal: 'modal-staff-workspace' },
    { label: '📅 Shift Schedule', modal: 'modal-shift-schedule' },
    { label: '📊 Reports',        modal: 'modal-reports' },
    { label: '🧾 Billing',        modal: 'modal-billing' }
  ]
};

/**
 * Render the top nav links for the given role and reveal the nav bar.
 * @param {string} role - 'guest' | 'staff' | 'admin'
 */
function buildNav(role) {
  const navEl = $('#nav-links');
  const topnav = $('#topnav');
  navEl.innerHTML = '';

  const links = NAV_LINKS[role] || [];
  links.forEach(({ label, modal }) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'nav-link';
    btn.textContent = label;
    btn.dataset.modal = modal;
    btn.setAttribute('aria-label', `Open ${label}`);
    btn.addEventListener('click', () => {
      $$('.nav-link').forEach(l => l.classList.remove('active'));
      btn.classList.add('active');
      openModal(modal);
    });
    li.appendChild(btn);
    navEl.appendChild(li);
  });

  show(topnav);
}

/* ============================================================
   4. VALIDATION MODULE
   ============================================================ */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Clear all validation error states on a form.
 * @param {HTMLFormElement} formEl
 */
function clearErrors(formEl) {
  $$('.input-error', formEl).forEach(el => el.classList.remove('input-error'));
  $$('.field-error', formEl).forEach(el => el.textContent = '');
}

/**
 * Show an inline error for a specific field.
 * @param {HTMLElement} input - The input/select/textarea
 * @param {string} message - Error message to show
 */
function showError(input, message) {
  input.classList.add('input-error');
  const errEl = document.getElementById(`err-${input.id}`);
  if (errEl) errEl.textContent = message;
}

/**
 * Validate a form. Returns true if valid.
 * Checks: required text/email, email format, positive numbers,
 *         date logic (checkout must be after checkin).
 * @param {HTMLFormElement} formEl
 * @returns {boolean}
 */
function validateForm(formEl) {
  clearErrors(formEl);
  let valid = true;

  // Find all required fields
  $$('[required]', formEl).forEach(field => {
    const tag = field.tagName.toLowerCase();
    const val = field.value.trim();

    if (!val) {
      showError(field, 'This field is required.');
      valid = false;
      return;
    }

    // Email validation
    if (field.type === 'email' && !EMAIL_REGEX.test(val)) {
      showError(field, 'Please enter a valid email address.');
      valid = false;
      return;
    }

    // Numeric (positive) validation
    if (field.type === 'number') {
      const num = parseFloat(val);
      const min = parseFloat(field.min) || 1;
      if (isNaN(num) || num < min) {
        showError(field, `Please enter a valid number (min ${min}).`);
        valid = false;
      }
    }

    // Password length
    if (field.type === 'password' && field.minLength && val.length < field.minLength) {
      showError(field, `Password must be at least ${field.minLength} characters.`);
      valid = false;
    }
  });

  // Check-in / check-out date logic
  const checkinEl  = formEl.querySelector('[name="checkin"]');
  const checkoutEl = formEl.querySelector('[name="checkout"]');

  if (checkinEl && checkoutEl && checkinEl.value && checkoutEl.value) {
    const ci  = new Date(checkinEl.value);
    const co  = new Date(checkoutEl.value);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (ci < today) {
      showError(checkinEl, 'Check-in date cannot be in the past.');
      valid = false;
    } else if (co <= ci) {
      showError(checkoutEl, 'Check-out must be strictly after check-in.');
      valid = false;
    }
  }

  return valid;
}

/* ============================================================
   5. AUTH MODULE
   ============================================================ */
function initAuth() {
  const tabLogin    = $('#tab-login');
  const tabRegister = $('#tab-register');
  const panelLogin  = $('#panel-login');
  const panelReg    = $('#panel-register');
  const formLogin   = $('#form-login');
  const formReg     = $('#form-register');
  const heading     = $('#auth-heading');

  // Tab switching
  tabLogin.addEventListener('click', () => switchAuthTab('login'));
  tabRegister.addEventListener('click', () => switchAuthTab('register'));

  function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    tabLogin.setAttribute('aria-selected', isLogin);
    tabRegister.setAttribute('aria-selected', !isLogin);
    toggle(panelLogin, isLogin);
    toggle(panelReg, !isLogin);
    heading.textContent = isLogin ? 'Welcome Back' : 'Create Account';
  }

  // Login submit
  formLogin.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(formLogin)) return;

    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    const role  = $('#login-role').value;
    
    // Changing button state
    const btn = formLogin.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
      const res = await fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      
      if (data.success) {
        loginUser(data.user);
        showToast('Successfully logged in.');
      } else {
        showError($('#login-password'), data.error || 'Login failed.');
      }
    } catch (err) {
      showError($('#login-password'), 'Network error. Please try again.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  // Register submit
  formReg.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(formReg)) return;

    const name  = $('#reg-name').value.trim();
    const email = $('#reg-email').value.trim();
    const password = $('#reg-password').value;
    const phone = $('#reg-phone') ? $('#reg-phone').value.trim() : '';
    const role  = $('#reg-role').value;

    // Changing button state
    const btn = formReg.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Registering...';
    btn.disabled = true;

    try {
      const res = await fetch('api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role })
      });
      const data = await res.json();
      
      if (data.success) {
        loginUser(data.user);
        showToast('Registration successful! You are now logged in.');
      } else {
        showError($('#reg-email'), data.error || 'Registration failed.');
      }
    } catch (err) {
      showError($('#reg-email'), 'Network error. Please try again.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  // One-click guest access — no fields needed
  $('#btn-guest-access').addEventListener('click', () => {
    loginUser({ name: 'Guest', email: 'guest@hotelier.com', role: 'guest' });
  });
}

/**
 * "Log in" the user, build the nav, close auth modal.
 */
function loginUser({ name, email, role }) {
  state.currentUser = { name, email, role };

  // Show user label in nav
  const roleLabel = { guest: 'Guest', staff: 'Receptionist', admin: 'Admin' }[role] || role;
  $('#nav-user-label').textContent = `${name} · ${roleLabel}`;

  // Pre-fill billing invoice with guest info
  state.booking.guestName  = name;
  state.booking.guestEmail = email;

  buildNav(role);
  closeModal();

  // Hide the CTA strip at the bottom after valid login
  hide($('#cta-strip'));
}

// Logout
$('#btn-logout').addEventListener('click', () => {
  state.currentUser = null;
  hide($('#topnav'));
  $('#nav-links').innerHTML = '';
  closeModal();

  // Show the CTA strip again
  show($('#cta-strip'));

  // Reset form states
  $$('form').forEach(f => f.reset());
  clearAllSuccessBanners();
});

function clearAllSuccessBanners() {
  $$('.success-banner').forEach(hide);
}

/* ============================================================
   6. LANDING PAGE BUTTONS
   ============================================================ */
$('#btn-signin').addEventListener('click', () => openModal('modal-auth'));

// Secondary Sign In (bottom CTA section)
$('#btn-signin-2').addEventListener('click', () => openModal('modal-auth'));

// Bottom CTA — Continue as Guest
$('#btn-guest-2').addEventListener('click', () => {
  loginUser({ name: 'Guest', email: 'guest@hotelier.com', role: 'guest' });
});

// Book Facilities button on facilities section
$('#btn-book-facilities').addEventListener('click', () => {
  if (state.currentUser) {
    openModal('modal-facilities');
  } else {
    openModal('modal-auth');
  }
});

// Room booking from landing page room cards
document.addEventListener('click', e => {
  const btn = e.target.closest('.room-book-btn');
  if (!btn) return;
  const roomType = btn.dataset.room;
  const rate     = btn.dataset.rate;
  if (state.currentUser) {
    openModal('modal-guest-booking');
    // Pre-select the room type
    setTimeout(() => {
      const sel = $('#book-room-type');
      if (sel) {
        sel.value = roomType;
        sel.dispatchEvent(new Event('change'));
      }
    }, 350);
  } else {
    openModal('modal-auth');
  }
});

$('#btn-booknow').addEventListener('click', () => {
  if (state.currentUser) {
    openModal('modal-guest-booking');
  } else {
    openModal('modal-auth');
  }
});

/* ============================================================
   7. GUEST ROOM BOOKING MODULE
   ============================================================ */
function initGuestBooking() {
  const form       = $('#form-booking');
  const roomType   = $('#book-room-type');
  const checkin    = $('#book-checkin');
  const checkout   = $('#book-checkout');
  const psRate     = $('#ps-rate');
  const psNights   = $('#ps-nights');
  const psTotal    = $('#ps-total');
  const successEl  = $('#booking-success');
  const confirmMsg = $('#booking-confirm-msg');

  // Set minimum date to today
  const todayISO = new Date().toISOString().split('T')[0];
  checkin.min  = todayISO;
  checkout.min = todayISO;

  // Update price display whenever room type or dates change
  function recalcPrice() {
    const opt  = roomType.options[roomType.selectedIndex];
    const rate = parseFloat(opt?.dataset?.rate) || 0;

    const ci = new Date(checkin.value);
    const co = new Date(checkout.value);
    const nights = (!isNaN(ci) && !isNaN(co) && co > ci)
      ? Math.round((co - ci) / 86400000)
      : 0;

    psRate.textContent   = rate ? `$${rate}` : '—';
    psNights.textContent = nights ? `${nights} night${nights !== 1 ? 's' : ''}` : '—';
    psTotal.textContent  = (rate && nights) ? `$${(rate * nights).toLocaleString()}` : '—';
  }

  roomType.addEventListener('change', recalcPrice);
  checkin.addEventListener('change', () => { checkout.min = checkin.value; recalcPrice(); });
  checkout.addEventListener('change', recalcPrice);

  // Form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const opt    = roomType.options[roomType.selectedIndex];
    const rate   = parseFloat(opt?.dataset?.rate) || 0;
    const ci     = new Date(checkin.value);
    const co     = new Date(checkout.value);
    const nights = Math.round((co - ci) / 86400000);

    // Save to state for billing
    state.booking = {
      ...state.booking,
      guestName:  $('#book-guest-name').value.trim(),
      guestEmail: $('#book-guest-email').value.trim(),
      roomType:   roomType.value,
      roomLabel:  opt?.text || roomType.value,
      checkin:    checkin.value,
      checkout:   checkout.value,
      nights,
      rate,
      total:      rate * nights
    };

    confirmMsg.textContent =
      `${state.booking.guestName} — ${state.booking.roomLabel}, ${nights} night${nights !== 1 ? 's' : ''}. Total: $${state.booking.total.toLocaleString()}`;

    hide(form);
    show(successEl);
    populateInvoice();
  });

  $('#btn-add-booking').addEventListener('click', () => {
    form.reset();
    clearErrors(form);
    psRate.textContent   = '—';
    psNights.textContent = '—';
    psTotal.textContent  = '—';
    hide(successEl);
    show(form);
    // Remove the guest info pre-fills if we want a fresh form
    $('#book-guest-name').value = state.currentUser ? state.currentUser.name : '';
    $('#book-guest-email').value = state.currentUser ? state.currentUser.email : '';
  });

  $('#btn-cancel-booking').addEventListener('click', () => {
    state.booking = {
      guestName: '', guestEmail: '', roomType: '', roomLabel: '',
      checkin: '', checkout: '', nights: 0, rate: 0, total: 0, facilities: []
    };
    state.selectedFacilities = {};
    
    // reset facilities UI manually since updateFacilitySummary is private
    const facSelectedList = $('#fac-selected-list');
    const facTotal = $('#fac-total');
    if (facSelectedList) facSelectedList.textContent = 'None';
    if (facTotal) facTotal.textContent = '$0';
    $$('.facility-card.selected').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-pressed', 'false');
      c.querySelector('.facility-badge').textContent = 'Add';
    });

    form.reset();
    clearErrors(form);
    psRate.textContent   = '—';
    psNights.textContent = '—';
    psTotal.textContent  = '—';
    hide(successEl);
    show(form);
    closeModal();
    showToast('Booking cancelled.');
    populateInvoice();
  });
}

/* ============================================================
   8. FACILITIES MODULE
   ============================================================ */
function initFacilities() {
  const cards       = $$('.facility-card');
  const selectedEl  = $('#fac-selected-list');
  const totalEl     = $('#fac-total');
  const confirmBtn  = $('#btn-confirm-facilities');

  function updateFacilitySummary() {
    const keys = Object.keys(state.selectedFacilities);
    selectedEl.textContent = keys.length ? keys.join(', ') : 'None';
    const sum = keys.reduce((acc, k) => acc + (state.selectedFacilities[k] || 0), 0);
    totalEl.textContent = `$${sum}`;
  }

  cards.forEach(card => {
    card.addEventListener('click', () => toggleFacility(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFacility(card);
      }
    });
  });

  function toggleFacility(card) {
    const key   = card.dataset.facility;
    const price = parseFloat(card.dataset.price) || 0;
    const badge = card.querySelector('.facility-badge');

    if (state.selectedFacilities[key] !== undefined) {
      delete state.selectedFacilities[key];
      card.classList.remove('selected');
      card.setAttribute('aria-pressed', 'false');
      badge.textContent = 'Add';
    } else {
      state.selectedFacilities[key] = price;
      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');
      badge.textContent = '✔ Added';
    }
    updateFacilitySummary();
  }

  confirmBtn.addEventListener('click', () => {
    state.booking.facilities = Object.keys(state.selectedFacilities);
    closeModal();
    // Brief confirmation toast
    showToast(`Facilities saved: ${state.booking.facilities.join(', ') || 'None'}`);
  });

  updateFacilitySummary();
}

/* ============================================================
   9. TOAST NOTIFICATION
   ============================================================ */
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%) translateY(10px)',
    background: 'rgba(44,26,14,0.92)',
    color: '#FAF7F2',
    padding: '0.65rem 1.5rem',
    borderRadius: '100px',
    fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
    zIndex: '9999',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    opacity: '0',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    backdropFilter: 'blur(8px)',
    pointerEvents: 'none'
  });
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   10. STAFF WORKSPACE — ROOM STATUS GRID
   ============================================================ */
function initStaffWorkspace() {
  const grid = $('#room-grid');

  // Generate 30 rooms across 3 floors
  const rooms = [];
  const statuses = ['available', 'occupied', 'available', 'maintenance', 'available'];
  for (let floor = 1; floor <= 3; floor++) {
    for (let num = 1; num <= 10; num++) {
      const roomNum = floor * 100 + num;
      const status  = statuses[(roomNum) % statuses.length];
      rooms.push({ number: roomNum, status });
    }
  }

  const CYCLE = ['available', 'occupied', 'maintenance'];
  const LABELS = { available: 'Open', occupied: 'Busy', maintenance: 'Maint.' };

  rooms.forEach(room => {
    const card = document.createElement('div');
    card.className = `room-card ${room.status}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Room ${room.number}: ${room.status}. Click to change status.`);
    card.innerHTML = `<span class="room-card-num">${room.number}</span>
                      <span class="room-card-label">${LABELS[room.status]}</span>`;

    function cycleStatus() {
      const idx = CYCLE.indexOf(room.status);
      room.status = CYCLE[(idx + 1) % CYCLE.length];
      card.className = `room-card ${room.status}`;
      card.querySelector('.room-card-label').textContent = LABELS[room.status];
      card.setAttribute('aria-label', `Room ${room.number}: ${room.status}. Click to change status.`);
      showToast(`Room ${room.number} → ${room.status}`);
    }

    card.addEventListener('click', cycleStatus);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleStatus(); }
    });

    grid.appendChild(card);
  });

  // Check-in / Check-out form
  const form      = $('#form-checkin');
  const successEl = $('#checkin-success');
  const msgEl     = $('#checkin-confirm-msg');

  const todayISO = new Date().toISOString().split('T')[0];
  $('#ci-checkin-date').min  = todayISO;
  $('#ci-checkout-date').min = todayISO;

  $('#ci-checkin-date').addEventListener('change', () => {
    $('#ci-checkout-date').min = $('#ci-checkin-date').value;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const guestName  = $('#ci-guest-name').value.trim();
    const roomNum    = $('#ci-room-number').value;
    const action     = $('#ci-action').value;
    const actionVerb = action === 'checkin' ? 'checked in' : 'checked out';

    msgEl.textContent = `${guestName} successfully ${actionVerb} — Room ${roomNum}.`;
    hide(form);
    show(successEl);
    showToast(`Room ${roomNum}: ${guestName} ${actionVerb}`);
  });
}

/* ============================================================
   11. SHIFT SCHEDULE MODULE
   ============================================================ */
function initShiftSchedule() {
  const SHIFTS = {
    M: '<span class="shift-morning">Morning</span>',
    E: '<span class="shift-evening">Evening</span>',
    N: '<span class="shift-night">Night</span>',
    O: '<span class="shift-off">Day Off</span>'
  };

  const employees = [
    { name: 'Amelia Hartwell',  role: 'Receptionist',    schedule: ['M','M','E','E','N','O','O'] },
    { name: 'James Okafor',     role: 'Receptionist',    schedule: ['E','M','M','O','M','E','N'] },
    { name: 'Sofia Chen',       role: 'Concierge',       schedule: ['M','O','M','M','E','E','N'] },
    { name: 'Luca Ricci',       role: 'Housekeeping',    schedule: ['N','E','O','M','M','E','M'] },
    { name: 'Priya Sharma',     role: 'Housekeeping',    schedule: ['O','N','E','E','M','M','E'] },
    { name: 'Ethan Blake',      role: 'Maintenance',     schedule: ['M','M','M','E','O','N','E'] },
    { name: 'Nina Volkov',      role: 'F&B Attendant',   schedule: ['E','E','N','M','O','M','M'] },
    { name: 'Carlos Mendez',    role: 'Security',        schedule: ['N','N','O','N','N','M','E'] }
  ];

  const tbody = $('#shift-tbody');
  employees.forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${emp.name}</strong></td>
      <td>${emp.role}</td>
      ${emp.schedule.map(s => `<td>${SHIFTS[s]}</td>`).join('')}
    `;
    tbody.appendChild(tr);
  });
}

/* ============================================================
   12. REPORTS — CSS BAR CHARTS
   ============================================================ */
function initReports() {
  const occupancyData = [
    { label: 'Jan', value: 76, display: '76%' },
    { label: 'Feb', value: 84, display: '84%' },
    { label: 'Mar', value: 92, display: '92%' },
    { label: 'Apr', value: 88, display: '88%' },
    { label: 'May', value: 94, display: '94%' },
    { label: 'Jun', value: 98, display: '98%' }
  ];

  const revenueData = [
    { label: 'Jan', value: 38, display: '$19K' },
    { label: 'Feb', value: 45, display: '$22K' },
    { label: 'Mar', value: 53, display: '$27K' },
    { label: 'Apr', value: 50, display: '$25K' },
    { label: 'May', value: 56, display: '$28K' },
    { label: 'Jun', value: 64, display: '$32K' }
  ];

  renderBarChart('#chart-occupancy', occupancyData);
  renderBarChart('#chart-revenue', revenueData);
}

/**
 * Render a CSS bar chart into the given container.
 * @param {string} selector
 * @param {Array<{label,value,display}>} data - value is % of max bar width
 */
function renderBarChart(selector, data) {
  const container = $(selector);
  if (!container) return;
  container.innerHTML = '';

  data.forEach(item => {
    const row = document.createElement('div');
    row.className = 'chart-bar-item';
    row.innerHTML = `
      <span class="chart-bar-label">${item.label}</span>
      <div class="chart-bar-track" role="progressbar" aria-valuenow="${item.value}" aria-valuemin="0" aria-valuemax="100">
        <div class="chart-bar-fill" style="width: 0%" data-target="${item.value}%"></div>
      </div>
      <span class="chart-bar-value">${item.display}</span>
    `;
    container.appendChild(row);
  });

  // Animate bars in when modal is opened
  setTimeout(() => {
    container.querySelectorAll('.chart-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.target;
    });
  }, 150);
}

/* ============================================================
   13. BILLING & INVOICE MODULE
   ============================================================ */
function initBilling() {
  // Set invoice date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  $('#inv-date').textContent = dateStr;

  // Invoice number (random)
  const invNum = `HTL-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  $('#inv-number').textContent = invNum;
}

/**
 * Populate invoice with current booking data.
 */
function populateInvoice() {
  const b = state.booking;
  if (!b.guestName) return;

  $('#inv-guest-name').textContent  = b.guestName  || '—';
  $('#inv-guest-email').textContent = b.guestEmail || '—';
  $('#inv-nights').textContent      = b.nights ? `${b.nights} night${b.nights !== 1 ? 's' : ''}` : '—';
  $('#inv-rate').textContent        = b.rate ? `$${b.rate}/night` : '—';
  $('#inv-room-total').textContent  = b.total ? `$${b.total.toLocaleString()}` : '—';

  // Facilities add-ons
  const tbody = $('#inv-items');
  // Remove any old facility rows
  $$('.inv-facility-row', tbody).forEach(r => r.remove());

  let facilitySum = 0;
  b.facilities.forEach(key => {
    const price = state.selectedFacilities[key] || 0;
    if (price > 0) {
      facilitySum += price;
      const tr = document.createElement('tr');
      tr.className = 'inv-facility-row';
      tr.innerHTML = `<td>${key.charAt(0).toUpperCase() + key.slice(1)}</td><td>1</td><td>$${price}</td><td>$${price}</td>`;
      tbody.appendChild(tr);
    }
  });

  const subtotal = b.total + facilitySum;
  const tax      = subtotal * 0.1;
  const grand    = subtotal + tax;

  $('#inv-subtotal').textContent = `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  $('#inv-tax').textContent      = `$${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  $('#inv-grand').textContent    = `$${grand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ============================================================
   14. STAR RATING MODULE
   ============================================================ */
function initStarRating() {
  // Main rating (large stars)
  const stars = $$('.star', $('#star-rating'));
  initStarGroup(stars, val => { state.starRating = val; });

  // Mini rating groups
  $$('.mini-stars').forEach(group => {
    const miniStars = $$('.mini-star', group);
    initStarGroup(miniStars, null);
  });

  // Review form submit
  const form    = $('#form-review');
  const success = $('#review-success');

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const errEl = $('#err-star-rating');
    if (state.starRating === 0) {
      errEl.textContent = 'Please select an overall star rating.';
      return;
    } else {
      errEl.textContent = '';
    }

    hide(form);
    show(success);
    showToast(`⭐ ${state.starRating}-star review submitted. Thank you!`);
  });
}

/**
 * Wire hover + click logic for a group of star elements.
 */
function initStarGroup(stars, onSelectCallback) {
  let selected = 0;

  stars.forEach((star, idx) => {
    star.addEventListener('mouseenter', () => highlightStars(stars, idx + 1, 'hovered'));
    star.addEventListener('mouseleave', () => highlightStars(stars, selected, 'selected'));
    star.addEventListener('click', () => {
      selected = idx + 1;
      highlightStars(stars, selected, 'selected');
      stars.forEach(s => { s.setAttribute('aria-checked', s.dataset.value <= selected ? 'true' : 'false'); });
      if (onSelectCallback) onSelectCallback(selected);
    });
    star.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selected = idx + 1;
        highlightStars(stars, selected, 'selected');
        if (onSelectCallback) onSelectCallback(selected);
      }
    });
  });
}

function highlightStars(stars, count, className) {
  // Clear all states first
  stars.forEach(s => s.classList.remove('hovered', 'selected'));
  // Apply to first 'count' stars
  stars.slice(0, count).forEach(s => s.classList.add(className));
}

/* ============================================================
   15. HAMBURGER MENU (MOBILE)
   ============================================================ */
$('#btn-hamburger').addEventListener('click', function () {
  const expanded = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', !expanded);
  $('#nav-links').classList.toggle('open');
  $('#topnav .topnav-user').classList.toggle('open');
});

/* ============================================================
   16. INIT — Run all modules
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initGuestBooking();
  initFacilities();
  initStaffWorkspace();
  initShiftSchedule();
  initReports();
  initBilling();
  initStarRating();

  // Scroll Reveal — IntersectionObserver
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger reveal for sibling elements in a grid
          const siblings = entry.target.closest('.features-grid, .rooms-grid, .landing-fac-grid, .services-grid');
          const delay = siblings
            ? [...siblings.querySelectorAll('.reveal')].indexOf(entry.target) * 80
            : 0;
          setTimeout(() => entry.target.classList.add('in-view'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Animate bar charts whenever Reports modal is opened
  const rechartsObserver = new MutationObserver(() => {
    if (!$('#modal-reports').classList.contains('hidden')) {
      $$('#chart-occupancy .chart-bar-fill, #chart-revenue .chart-bar-fill').forEach(bar => {
        bar.style.width = '0%';
        setTimeout(() => bar.style.width = bar.dataset.target, 150);
      });
    }
  });

  rechartsObserver.observe($('#modal-reports'), { attributes: true, attributeFilter: ['class'] });

  console.log('%c🏨 Hotelier — System Loaded', 'color:#C9A87C;font-weight:700;font-size:14px;');
});
