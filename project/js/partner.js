/* ========================================
   TIKRI JUNCTION — DELIVERY PARTNER JS
   Premium Interactive Features
   ======================================== */

// ── DOM References ──
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ── State ──
const state = {
  currentScreen: 'login',
  isOnline: true,
  orderTimerInterval: null,
  otpTimerInterval: null,
  orderTimerValue: 30,
  phone: '',
  sessionToken: null,
};

// ── Backend API URL ──
const API_URL = 'http://localhost:3001/api';


/* ========================================
   PREMIUM: Floating Particle System
   ======================================== */
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.resize();
    this.init();

    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(40, Math.floor(window.innerWidth / 30));
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
    this.animate();
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() > 0.6 ? 38 : Math.random() > 0.3 ? 142 : 270,
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      // Move
      p.x += p.speedX;
      p.y += p.speedY;

      // Mouse repulsion
      const dx = p.x - this.mouseX;
      const dy = p.y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        p.x += (dx / dist) * force * 0.8;
        p.y += (dy / dist) * force * 0.8;
      }

      // Wrap edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
      this.ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        if (d < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `hsla(38, 80%, 60%, ${0.06 * (1 - d / 100)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}


/* ========================================
   PREMIUM: Confetti Explosion
   ======================================== */
function launchConfetti(count = 50) {
  const container = $('#confetti-container');
  if (!container) return;

  const colors = ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#fbbf24', '#06b6d4'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shapes = ['circle', 'square', 'strip'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    let width, height, borderRadius;
    if (shape === 'circle') {
      width = height = Math.random() * 8 + 4;
      borderRadius = '50%';
    } else if (shape === 'square') {
      width = height = Math.random() * 8 + 4;
      borderRadius = '2px';
    } else {
      width = Math.random() * 4 + 2;
      height = Math.random() * 12 + 8;
      borderRadius = '1px';
    }

    Object.assign(piece.style, {
      left: `${Math.random() * 100}%`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color,
      borderRadius: borderRadius,
      animationDuration: `${Math.random() * 2 + 2}s`,
      animationDelay: `${Math.random() * 0.5}s`,
      transform: `rotateZ(${Math.random() * 360}deg)`,
    });

    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}


/* ========================================
   PREMIUM: Ripple Click Effect
   ======================================== */
function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';

  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Attach ripple to all buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button, .btn-primary-full, .btn-accept, .btn-decline, .btn-delivered, .btn-navigate, .btn-call, .nav-item, .tab-btn, .period-tab, .vehicle-card');
  if (btn) {
    addRipple(e);
  }
});


/* ========================================
   PREMIUM: Counter Animation
   ======================================== */
function animateCounter(element, target, duration = 1000) {
  const start = 0;
  const startTime = performance.now();
  const prefix = target.toString().match(/^[^\d]*/)[0];
  const suffix = target.toString().match(/[^\d]*$/)[0];
  const numStr = target.toString().replace(/[^\d.]/g, '');
  const num = parseFloat(numStr);
  const hasDecimal = numStr.includes('.');
  const decimalPlaces = hasDecimal ? numStr.split('.')[1].length : 0;

  if (isNaN(num)) {
    element.textContent = target;
    return;
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    const current = start + (num - start) * eased;

    if (hasDecimal) {
      element.textContent = prefix + current.toFixed(decimalPlaces) + suffix;
    } else {
      element.textContent = prefix + Math.floor(current).toLocaleString('en-IN') + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
      element.classList.add('bump');
      setTimeout(() => element.classList.remove('bump'), 300);
    }
  }

  requestAnimationFrame(update);
}


/* ========================================
   PREMIUM: Haptic Vibration Feedback
   ======================================== */
function haptic(style = 'light') {
  if (!navigator.vibrate) return;
  switch (style) {
    case 'light': navigator.vibrate(10); break;
    case 'medium': navigator.vibrate(25); break;
    case 'heavy': navigator.vibrate([30, 10, 30]); break;
    case 'success': navigator.vibrate([10, 50, 20]); break;
    case 'error': navigator.vibrate([50, 30, 50]); break;
  }
}


/* ========================================
   PREMIUM: Sound Effect System
   ======================================== */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playTone(freq = 800, duration = 0.1, type = 'sine', volume = 0.08) {
  try {
    if (!audioCtx) audioCtx = new AudioCtx();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

function playNotifSound() { playTone(880, 0.15, 'sine', 0.06); setTimeout(() => playTone(1100, 0.1, 'sine', 0.04), 150); }
function playSuccessSound() { playTone(600, 0.1, 'sine', 0.05); setTimeout(() => playTone(800, 0.1, 'sine', 0.05), 100); setTimeout(() => playTone(1000, 0.15, 'sine', 0.04), 200); }
function playErrorSound() { playTone(300, 0.2, 'square', 0.04); }
function playClickSound() { playTone(1200, 0.05, 'sine', 0.03); }


/* ========================================
   SPLASH SCREEN
   ======================================== */
window.addEventListener('load', () => {
  // Initialize particle system
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    new ParticleSystem(canvas);
  }

  // Hide splash
  setTimeout(() => {
    const splash = $('#splashScreen');
    splash.classList.add('hide');
    setTimeout(() => splash.style.display = 'none', 600);
  }, 2200);
});


/* ========================================
   SCREEN NAVIGATION
   ======================================== */
function showScreen(screenId) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`#screen-${screenId}`);
  if (target) {
    target.classList.add('active');
    state.currentScreen = screenId;
  }

  haptic('light');
  playClickSound();

  // Start order timer if on dashboard
  if (screenId === 'dashboard') {
    startOrderTimer();
    // Animate stat counters
    setTimeout(() => {
      const statValues = target.querySelectorAll('.stat-value');
      statValues.forEach(sv => {
        const original = sv.textContent;
        animateCounter(sv, original, 800);
      });
    }, 300);
  } else {
    clearInterval(state.orderTimerInterval);
  }

  // Animate profile stats
  if (screenId === 'profile') {
    setTimeout(() => {
      const profileStatValues = target.querySelectorAll('.profile-stat-value');
      profileStatValues.forEach(sv => {
        const original = sv.textContent;
        animateCounter(sv, original, 1000);
      });
    }, 300);
  }

  // Animate earnings
  if (screenId === 'earnings') {
    setTimeout(() => {
      const earningsAmount = target.querySelector('.earnings-amount');
      if (earningsAmount) {
        animateCounter(earningsAmount, earningsAmount.textContent, 1200);
      }
    }, 300);
  }
}


/* ========================================
   TOAST NOTIFICATIONS (ENHANCED)
   ======================================== */
function showToast(message, type = 'info', duration = 3000) {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  toast.style.position = 'relative';
  toast.style.overflow = 'hidden';
  container.appendChild(toast);

  // Sound
  if (type === 'success') playSuccessSound();
  else if (type === 'error') playErrorSound();
  else playNotifSound();

  // Haptic
  if (type === 'success') haptic('success');
  else if (type === 'error') haptic('error');
  else haptic('light');

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


/* ========================================
   LOGIN FLOW — Real Backend OTP
   ======================================== */
const loginPhone = $('#login-phone');
const btnSendOtp = $('#btn-send-otp');
const btnVerifyOtp = $('#btn-verify-otp');
const btnBackToPhone = $('#btn-back-to-phone');
const linkRegister = $('#link-register');
const otpBoxes = $$('.otp-box');

// Phone input validation
loginPhone.addEventListener('input', () => {
  const val = loginPhone.value.replace(/\D/g, '');
  loginPhone.value = val;
  btnSendOtp.disabled = val.length !== 10;
});

// ── Send OTP (calls backend) ──
btnSendOtp.addEventListener('click', async () => {
  const phone = loginPhone.value.trim();
  if (phone.length !== 10) return;

  // Button loading state
  btnSendOtp.textContent = 'Sending...';
  btnSendOtp.disabled = true;

  try {
    const res = await fetch(`${API_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    // Store phone in state
    state.phone = phone;

    // Show OTP screen
    const formatted = `+91 ${phone.slice(0,5)} ${phone.slice(5)}`;
    $('#otp-phone-display').textContent = formatted;
    $('#login-step-phone').classList.remove('active');
    $('#login-step-otp').classList.add('active');

    startOtpTimer(data.expiresIn || 120);
    setTimeout(() => otpBoxes[0]?.focus(), 300);

    // DEV MODE: show OTP in a beautiful full-screen modal
    if (data.devOtp) {
      showDevOtpModal(data.devOtp);
    } else {
      showToast(`📩 OTP sent to +91 ${phone.slice(0,5)}XXXXX`, 'success');
    }

  } catch (err) {
    showToast(`❌ ${err.message}`, 'error', 4000);
    btnSendOtp.disabled = false;
  } finally {
    btnSendOtp.textContent = 'Send OTP';
    btnSendOtp.disabled = (loginPhone.value.length !== 10);
  }
});

// OTP input handling
otpBoxes.forEach((box, idx) => {
  box.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val;

    if (val && idx < otpBoxes.length - 1) {
      otpBoxes[idx + 1].focus();
    }

    if (val) {
      box.classList.add('filled');
      playTone(800 + idx * 100, 0.08, 'sine', 0.03);
    } else {
      box.classList.remove('filled');
    }

    const allFilled = Array.from(otpBoxes).every(b => b.value.length === 1);
    btnVerifyOtp.disabled = !allFilled;
  });

  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && idx > 0) {
      otpBoxes[idx - 1].focus();
      otpBoxes[idx - 1].value = '';
      otpBoxes[idx - 1].classList.remove('filled');
    }
  });

  box.addEventListener('paste', (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
    if (paste.length >= 4) {
      otpBoxes.forEach((b, i) => {
        b.value = paste[i] || '';
        if (b.value) b.classList.add('filled');
      });
      otpBoxes[3].focus();
      btnVerifyOtp.disabled = false;
    }
  });
});

// OTP Timer
function startOtpTimer(totalSeconds = 120) {
  let time = totalSeconds;
  const countdown = $('#resend-countdown');
  const resendBtn = $('#btn-resend-otp');
  const timerEl = $('.resend-timer');

  resendBtn.classList.add('hidden');
  timerEl.classList.remove('hidden');
  countdown.textContent = time;

  clearInterval(state.otpTimerInterval);
  state.otpTimerInterval = setInterval(() => {
    time--;
    countdown.textContent = time;
    if (time <= 0) {
      clearInterval(state.otpTimerInterval);
      timerEl.classList.add('hidden');
      resendBtn.classList.remove('hidden');
    }
  }, 1000);
}

// ── Resend OTP (calls backend) ──
$('#btn-resend-otp').addEventListener('click', async () => {
  const resendBtn = $('#btn-resend-otp');
  resendBtn.textContent = 'Sending...';
  resendBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.phone }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message);

    // Clear boxes
    otpBoxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
    btnVerifyOtp.disabled = true;
    otpBoxes[0]?.focus();
    startOtpTimer(data.expiresIn || 120);

    if (data.devOtp) {
      showToast(
        `📩 New OTP: <strong style="font-size:20px;letter-spacing:4px;color:#fbbf24">${data.devOtp}</strong> <small>(Dev)</small>`,
        'info', 8000
      );
      const digits = data.devOtp.split('');
      otpBoxes.forEach((box, i) => {
        if (digits[i]) { box.value = digits[i]; box.classList.add('filled'); }
      });
      btnVerifyOtp.disabled = false;
    } else {
      showToast('📩 New OTP sent!', 'success');
    }
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error', 4000);
  } finally {
    resendBtn.textContent = 'Resend OTP';
    resendBtn.disabled = false;
  }
});

// ── Verify OTP (calls backend) ──
btnVerifyOtp.addEventListener('click', async () => {
  const otp = Array.from(otpBoxes).map(b => b.value).join('');
  if (otp.length !== 4) return;

  // Button loading state
  btnVerifyOtp.textContent = 'Verifying...';
  btnVerifyOtp.disabled = true;

  // Visual shimmer on OTP boxes
  otpBoxes.forEach(b => b.style.borderColor = 'var(--primary)');

  try {
    const res = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.phone, otp }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      // Wrong OTP — shake the boxes
      otpBoxes.forEach(b => {
        b.style.borderColor = 'var(--accent-red)';
        b.style.animation = 'shake 0.4s ease';
        setTimeout(() => {
          b.style.animation = '';
          b.style.borderColor = '';
        }, 500);
      });
      haptic('error');
      playErrorSound();
      throw new Error(data.message || 'Invalid OTP');
    }

    // ✅ Success
    state.sessionToken = data.token;
    sessionStorage.setItem('partner_token', data.token);
    sessionStorage.setItem('partner_phone', state.phone);

    // Green boxes
    otpBoxes.forEach(b => b.style.borderColor = 'var(--accent-green)');

    clearInterval(state.otpTimerInterval);
    showToast('✅ Login successful! Welcome back 🛵', 'success');
    launchConfetti(40);
    haptic('success');
    playSuccessSound();
    setTimeout(() => showScreen('dashboard'), 900);

  } catch (err) {
    showToast(`❌ ${err.message}`, 'error', 4000);
    btnVerifyOtp.disabled = false;
  } finally {
    btnVerifyOtp.textContent = 'Verify & Login';
    const allFilled = Array.from(otpBoxes).every(b => b.value.length === 1);
    btnVerifyOtp.disabled = !allFilled;
  }
});

// Back to Phone
btnBackToPhone.addEventListener('click', () => {
  $('#login-step-otp').classList.remove('active');
  $('#login-step-phone').classList.add('active');
  clearInterval(state.otpTimerInterval);
  // Re-enable send button
  btnSendOtp.disabled = (loginPhone.value.length !== 10);
});

// Go to Register
linkRegister.addEventListener('click', (e) => {
  e.preventDefault();
  showScreen('register');
});


/* ========================================
   REGISTRATION FLOW
   ======================================== */
const regSteps = $$('.register-step');
const stepDots = $$('.step-dot');
const stepLines = $$('.step-line');

function showRegStep(stepNum) {
  regSteps.forEach(s => s.classList.remove('active'));
  const target = $(`#reg-step-${stepNum}`);
  if (target) target.classList.add('active');

  stepDots.forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i + 1 < stepNum) dot.classList.add('completed');
    else if (i + 1 === stepNum) dot.classList.add('active');
  });

  stepLines.forEach((line, i) => {
    line.classList.remove('active', 'completed');
    if (i + 1 < stepNum) line.classList.add('completed');
    else if (i + 1 === stepNum) line.classList.add('active');
  });

  haptic('medium');
}

$('#btn-back-to-login').addEventListener('click', () => {
  showScreen('login');
  showRegStep(1);
});

$('#btn-reg-next-1').addEventListener('click', () => showRegStep(2));
$('#btn-reg-back-2').addEventListener('click', () => showRegStep(1));
$('#btn-reg-next-2').addEventListener('click', () => showRegStep(3));
$('#btn-reg-back-3').addEventListener('click', () => showRegStep(2));

$('#btn-reg-submit').addEventListener('click', () => {
  showToast('🎉 Application submitted!', 'success');
  launchConfetti(60);
  haptic('success');
  playSuccessSound();

  regSteps.forEach(s => s.classList.remove('active'));
  $('#reg-step-success').classList.add('active');

  stepDots.forEach(d => d.classList.add('completed'));
  stepLines.forEach(l => l.classList.add('completed'));
});

$('#btn-go-login').addEventListener('click', () => {
  showScreen('login');
  showRegStep(1);
});

// Upload card click simulation with animation
$$('.upload-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!card.classList.contains('uploaded')) {
      // Add loading state
      const status = card.querySelector('.upload-status');
      const icon = card.querySelector('.upload-icon');
      status.textContent = 'Uploading...';
      icon.textContent = '⏳';
      card.style.borderColor = 'var(--primary)';

      // Simulate upload delay
      setTimeout(() => {
        card.classList.add('uploaded');
        status.textContent = 'Uploaded ✓';
        icon.textContent = '✅';
        showToast('📄 Document uploaded!', 'success');
        haptic('success');
      }, 800);
    }
  });
});


/* ========================================
   DASHBOARD
   ======================================== */

// Online/Offline Toggle
$('#online-toggle').addEventListener('change', (e) => {
  state.isOnline = e.target.checked;
  const dot = $('#status-dot');
  const label = $('#status-label');
  const sub = $('#status-sub');
  const card = e.target.closest('.status-toggle-card');

  if (state.isOnline) {
    dot.classList.add('online');
    label.textContent = "You're Online";
    sub.textContent = 'Accepting orders';
    if (card) card.style.setProperty('--status-color', 'var(--accent-green)');
    showToast('🟢 You are now online!', 'success');
  } else {
    dot.classList.remove('online');
    label.textContent = "You're Offline";
    sub.textContent = 'Not accepting orders';
    showToast('🔴 You are now offline', 'warning');
  }

  haptic('medium');
});

// Order Timer
function startOrderTimer() {
  state.orderTimerValue = 30;
  const circle = $('#timer-circle');
  const text = $('#timer-text');
  const circumference = 2 * Math.PI * 16;

  if (!circle || !text) return;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = 0;
  circle.style.stroke = '#f59e0b';
  text.style.color = '#f59e0b';
  text.textContent = 30;

  clearInterval(state.orderTimerInterval);
  state.orderTimerInterval = setInterval(() => {
    state.orderTimerValue--;
    text.textContent = state.orderTimerValue;
    const offset = circumference * (1 - state.orderTimerValue / 30);
    circle.style.strokeDashoffset = offset;

    // Warning color change
    if (state.orderTimerValue <= 10) {
      circle.style.stroke = '#ef4444';
      text.style.color = '#ef4444';
    }

    // Critical: last 5 seconds tick sound
    if (state.orderTimerValue <= 5 && state.orderTimerValue > 0) {
      playTone(600, 0.08, 'sine', 0.03);
    }

    if (state.orderTimerValue <= 0) {
      clearInterval(state.orderTimerInterval);
      const orderCard = $('#live-order-card');
      if (orderCard) orderCard.classList.add('declined');
      showToast('⏰ Order expired — auto-declined', 'warning');
      haptic('error');
    }
  }, 1000);

  // Play new order notification sound
  playNotifSound();
}

// Accept Order
$('#btn-accept-order').addEventListener('click', () => {
  clearInterval(state.orderTimerInterval);
  const orderCard = $('#live-order-card');
  orderCard.classList.add('declined');
  showToast('✅ Order accepted! Navigate to pickup.', 'success');
  launchConfetti(30);
  haptic('success');
  playSuccessSound();

  setTimeout(() => showScreen('orders'), 1200);
});

// Decline Order
$('#btn-decline-order').addEventListener('click', () => {
  clearInterval(state.orderTimerInterval);
  const orderCard = $('#live-order-card');

  // Shake animation before hiding
  orderCard.style.animation = 'none';
  orderCard.offsetHeight; // reflow
  orderCard.style.animation = 'shake 0.4s ease';
  setTimeout(() => {
    orderCard.classList.add('declined');
  }, 400);

  showToast('❌ Order declined', 'error');
  haptic('error');
  playErrorSound();
});

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// Notifications Panel
$('#btn-notifications').addEventListener('click', () => {
  $('#notif-panel').classList.add('open');
  playNotifSound();
  haptic('light');
});

$('#btn-close-notif').addEventListener('click', () => {
  $('#notif-panel').classList.remove('open');
});


/* ========================================
   BOTTOM NAVIGATION
   ======================================== */
document.addEventListener('click', (e) => {
  const navItem = e.target.closest('.nav-item');
  if (!navItem) return;

  const tab = navItem.dataset.tab;
  if (!tab) return;

  showScreen(tab);

  $$('.bottom-nav').forEach(nav => {
    nav.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tab);
    });
  });
});


/* ========================================
   ORDERS TAB
   ======================================== */
$$('.tab-btn[data-order-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.orderTab;

    $$('.tab-btn[data-order-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    $$('.order-tab-content').forEach(content => content.classList.remove('active'));
    $(`#orders-${tab}`).classList.add('active');
  });
});

// Mark Delivered
const btnDelivered = $('#btn-mark-delivered');
if (btnDelivered) {
  btnDelivered.addEventListener('click', () => {
    showToast('🎉 Order marked as delivered!', 'success');
    launchConfetti(40);
    haptic('success');
    playSuccessSound();

    setTimeout(() => {
      const activeContent = $('#orders-active');
      if (activeContent) {
        activeContent.innerHTML = `
          <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <div style="font-size: 64px; margin-bottom: 16px; animation: float 3s ease-in-out infinite;">📦</div>
            <h3 style="color: var(--text-primary); margin-bottom: 8px; font-size: 18px;">All caught up!</h3>
            <p style="font-size: 14px; line-height: 1.5;">No active orders right now.<br>Go online to receive new orders.</p>
          </div>
        `;
      }
    }, 800);
  });
}

// Navigate & Call buttons
const btnNavigate = $('#btn-navigate');
if (btnNavigate) {
  btnNavigate.addEventListener('click', () => {
    showToast('📍 Opening Google Maps navigation...', 'info');
    haptic('light');
  });
}

const btnCall = $('#btn-call-customer');
if (btnCall) {
  btnCall.addEventListener('click', () => {
    showToast('📞 Calling Amit Kumar...', 'info');
    haptic('light');
  });
}


/* ========================================
   EARNINGS TAB
   ======================================== */
const earningsData = {
  today: { amount: '₹847', comparison: '<span class="earnings-up">↑ 12%</span> vs yesterday' },
  week: { amount: '₹4,357', comparison: '<span class="earnings-up">↑ 8%</span> vs last week' },
  month: { amount: '₹16,420', comparison: '<span class="earnings-up">↑ 15%</span> vs last month' },
};

$$('.period-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.period-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const period = tab.dataset.period;
    const data = earningsData[period];
    if (data) {
      const amountEl = $('#earnings-amount');
      amountEl.textContent = data.amount;
      animateCounter(amountEl, data.amount, 800);
      $('#earnings-comparison').innerHTML = data.comparison;
    }
  });
});

// Payout Request
const btnPayout = $('#btn-request-payout');
if (btnPayout) {
  btnPayout.addEventListener('click', () => {
    btnPayout.textContent = 'Processing...';
    btnPayout.disabled = true;
    btnPayout.style.opacity = '0.6';

    // Simulate processing animation
    let dots = 0;
    const loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      btnPayout.textContent = 'Processing' + '.'.repeat(dots);
    }, 300);

    setTimeout(() => {
      clearInterval(loadingInterval);
      showToast('💰 ₹4,357 will be credited to SBI ••••1234 within 2 hours!', 'success', 4000);
      launchConfetti(30);
      haptic('success');
      playSuccessSound();
      btnPayout.textContent = '✓ Payout Requested';
      btnPayout.style.background = 'rgba(34, 197, 94, 0.15)';
      btnPayout.style.color = 'var(--accent-green)';
      btnPayout.style.boxShadow = 'none';
      btnPayout.style.opacity = '1';
      btnPayout.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    }, 2000);
  });
}


/* ========================================
   PROFILE
   ======================================== */
$('#btn-logout').addEventListener('click', () => {
  showToast('🚪 Logged out successfully', 'info');
  haptic('medium');

  loginPhone.value = '';
  btnSendOtp.disabled = true;
  otpBoxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });

  $('#login-step-otp').classList.remove('active');
  $('#login-step-phone').classList.add('active');

  // Reset order card
  const orderCard = $('#live-order-card');
  if (orderCard) {
    orderCard.classList.remove('declined');
    orderCard.style.animation = '';
  }

  // Reset payout button
  if (btnPayout) {
    btnPayout.textContent = 'Request Instant Payout';
    btnPayout.disabled = false;
    btnPayout.style.background = '';
    btnPayout.style.color = '';
    btnPayout.style.boxShadow = '';
    btnPayout.style.opacity = '';
    btnPayout.style.border = '';
  }

  setTimeout(() => showScreen('login'), 500);
});

// Menu item clicks with enhanced feedback
$$('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    haptic('light');
    playClickSound();

    // Highlight animation
    item.style.borderColor = 'var(--primary)';
    item.style.background = 'rgba(245, 158, 11, 0.08)';
    setTimeout(() => {
      item.style.borderColor = '';
      item.style.background = '';
    }, 500);
  });
});


/* ========================================
   KEYBOARD SHORTCUTS (Desktop Testing)
   ======================================== */
document.addEventListener('keydown', (e) => {
  // Only trigger if not typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

  if (e.key === '1') showScreen('login');
  if (e.key === '2') showScreen('register');
  if (e.key === '3') showScreen('dashboard');
  if (e.key === '4') showScreen('orders');
  if (e.key === '5') showScreen('earnings');
  if (e.key === '6') showScreen('profile');
  if (e.key === 'c') launchConfetti(60);
});


/* ========================================
   SCROLL REVEAL (for scrollable screens)
   ======================================== */
const observerOptions = {
  root: null,
  threshold: 0.1,
  rootMargin: '0px',
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

$$('.reveal-on-scroll').forEach(el => revealObserver.observe(el));
