/* ========================================
   TIKRI JUNCTION — PARTNER BACKEND
   OTP Auth Server (Twilio + Fast2SMS + DevMode)
   ======================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_DEV = process.env.NODE_ENV !== 'production';

// ── OTP Store (in-memory) ──
const otpStore = new Map();

// ── Config ──
const OTP_EXPIRY_MS = (parseInt(process.env.OTP_EXPIRY_SECONDS) || 120) * 1000;
const OTP_LENGTH    = parseInt(process.env.OTP_LENGTH) || 4;

// Provider credentials
const TWILIO_SID    = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_TOKEN  = process.env.TWILIO_AUTH_TOKEN  || '';
const TWILIO_FROM   = process.env.TWILIO_FROM_NUMBER || '';
const FAST2SMS_KEY  = process.env.FAST2SMS_API_KEY   || '';

/* ========================================
   MIDDLEWARE
   ======================================== */
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET','POST'] }));

const sendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 5,
  message: { success: false, message: 'Too many OTP requests. Wait 10 minutes.' }
});
const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many attempts. Try again later.' }
});

/* ========================================
   HELPERS
   ======================================== */
function generateOtp(len = 4) {
  const min = Math.pow(10, len - 1);
  return String(Math.floor(min + Math.random() * (9 * min)));
}

function isValidPhone(p) {
  return /^[6-9]\d{9}$/.test(p);
}

/* ── SMS PROVIDERS ── */

// 1. Twilio (free $15 trial — no recharge needed)
async function sendViaTwilio(phone, otp) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) return null;
  try {
    const client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
    const msg = await client.messages.create({
      body: `${otp} is your Tikri Junction delivery partner OTP. Valid for 2 minutes. Do not share.`,
      from: TWILIO_FROM,
      to: `+91${phone}`,
    });
    console.log(`✅ Twilio SMS sent — SID: ${msg.sid}`);
    return { success: true };
  } catch (e) {
    console.warn(`⚠️  Twilio failed: ${e.message}`);
    return null;
  }
}

// 2. Fast2SMS (needs ₹100 recharge for API routes)
async function sendViaFast2SMS(phone, otp) {
  if (!FAST2SMS_KEY || FAST2SMS_KEY === 'your_fast2sms_api_key_here') return null;
  const axios = require('axios');
  const routes = [
    { route: 'q', message: `${otp} is your Tikri Junction OTP. Valid 2 mins.`, language: 'english', flash: 0, numbers: phone },
    { route: 'p', message: `${otp} is your Tikri Junction OTP. Valid 2 mins.`, language: 'english', flash: 0, numbers: phone },
  ];
  for (const body of routes) {
    try {
      const { data } = await axios.post('https://www.fast2sms.com/dev/bulkV2', body, {
        headers: { authorization: FAST2SMS_KEY, 'Content-Type': 'application/json' },
        timeout: 8000,
      });
      if (data.return === true) {
        console.log(`✅ Fast2SMS sent via route '${body.route}'`);
        return { success: true };
      }
      console.warn(`⚠️  Fast2SMS route '${body.route}': ${data.message}`);
    } catch (e) {
      console.warn(`⚠️  Fast2SMS route '${body.route}' error: ${e.response?.data?.message || e.message}`);
    }
  }
  return null;
}

// Master send function — tries providers in order, falls back to dev mode
async function sendOtp(phone, otp) {
  // Try Twilio first
  const twilioResult = await sendViaTwilio(phone, otp);
  if (twilioResult?.success) return { success: true, devMode: false, provider: 'twilio' };

  // Try Fast2SMS
  const f2sResult = await sendViaFast2SMS(phone, otp);
  if (f2sResult?.success) return { success: true, devMode: false, provider: 'fast2sms' };

  // Dev mode fallback — OTP shown on screen
  console.log(`\n📱 [DEV MODE] OTP for +91 ${phone}: ${otp}\n`);
  return { success: true, devMode: true, provider: 'screen' };
}

// Cleanup expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpStore) if (v.expiresAt < now) otpStore.delete(k);
}, 5 * 60 * 1000);

/* ========================================
   ROUTES
   ======================================== */
app.get('/', (req, res) => res.json({
  service: 'Tikri Junction Partner Backend',
  status: 'running',
  mode: IS_DEV ? 'development' : 'production',
  sms: TWILIO_SID ? 'twilio' : FAST2SMS_KEY !== 'your_fast2sms_api_key_here' ? 'fast2sms' : 'devmode',
}));

/* ── POST /api/send-otp ── */
app.post('/api/send-otp', sendLimiter, async (req, res) => {
  const phone = (req.body.phone || '').replace(/\D/g, '').replace(/^91/, '');

  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });
  if (!isValidPhone(phone)) return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });

  // Cooldown check (30s between resends)
  const existing = otpStore.get(phone);
  if (existing && existing.sentAt > Date.now() - 30000) {
    const wait = Math.ceil((existing.sentAt + 30000 - Date.now()) / 1000);
    return res.status(429).json({ success: false, message: `Please wait ${wait}s before requesting a new OTP.` });
  }

  const otp = generateOtp(OTP_LENGTH);
  otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS, sentAt: Date.now(), attempts: 0 });

  const result = await sendOtp(phone, otp);

  const response = {
    success: true,
    message: result.devMode
      ? `OTP generated for +91 ${phone.slice(0,5)}XXXXX (shown on screen)`
      : `OTP sent to +91 ${phone.slice(0,5)}XXXXX via SMS`,
    expiresIn: OTP_EXPIRY_MS / 1000,
    provider: result.provider,
  };

  if (result.devMode) {
    response.devOtp = otp;
    response.devMode = true;
  }

  return res.json(response);
});

/* ── POST /api/verify-otp ── */
app.post('/api/verify-otp', verifyLimiter, (req, res) => {
  const phone = (req.body.phone || '').replace(/\D/g, '').replace(/^91/, '');
  const otp   = String(req.body.otp || '').trim();

  if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required.' });
  if (!isValidPhone(phone)) return res.status(400).json({ success: false, message: 'Invalid phone number.' });

  const stored = otpStore.get(phone);
  if (!stored) return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
  }
  if (stored.attempts >= 5) {
    otpStore.delete(phone);
    return res.status(429).json({ success: false, message: 'Too many wrong attempts. Request a new OTP.' });
  }
  if (otp !== stored.otp) {
    stored.attempts++;
    const left = 5 - stored.attempts;
    return res.status(400).json({ success: false, message: `Wrong OTP. ${left} attempt${left !== 1 ? 's' : ''} left.`, attemptsLeft: left });
  }

  otpStore.delete(phone);
  const token = Buffer.from(`${phone}:${Date.now()}:tikrijunction`).toString('base64');

  return res.json({
    success: true,
    message: 'OTP verified!',
    token,
    partner: { phone, loginAt: new Date().toISOString() },
  });
});

/* ── POST /api/resend-otp ── */
app.post('/api/resend-otp', sendLimiter, async (req, res) => {
  const phone = (req.body.phone || '').replace(/\D/g, '').replace(/^91/, '');
  if (!phone || !isValidPhone(phone)) return res.status(400).json({ success: false, message: 'Invalid phone.' });

  otpStore.delete(phone);
  const otp = generateOtp(OTP_LENGTH);
  otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS, sentAt: Date.now(), attempts: 0 });

  const result = await sendOtp(phone, otp);
  const response = {
    success: true,
    message: result.devMode ? 'New OTP generated (shown on screen)' : 'New OTP sent via SMS',
    expiresIn: OTP_EXPIRY_MS / 1000,
    provider: result.provider,
  };
  if (result.devMode) { response.devOtp = otp; response.devMode = true; }
  return res.json(response);
});

/* ── 404 & Error ── */
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ success: false, message: 'Server error.' }); });

/* ========================================
   START
   ======================================== */
app.listen(PORT, () => {
  const smsMode = TWILIO_SID ? '✅ Twilio (real SMS)' :
    (FAST2SMS_KEY && FAST2SMS_KEY !== 'your_fast2sms_api_key_here') ? '⚡ Fast2SMS' :
    '📱 Dev Mode (OTP on screen)';

  console.log('\n========================================');
  console.log('  Tikri Junction Partner Backend');
  console.log('========================================');
  console.log(`  URL  : http://localhost:${PORT}`);
  console.log(`  Mode : ${IS_DEV ? 'Development' : 'Production'}`);
  console.log(`  SMS  : ${smsMode}`);
  console.log('========================================\n');
});
