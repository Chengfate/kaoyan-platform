import { Router } from 'express';
import db from '../database.js';
import { hashPassword, verifyPassword, createToken, authMiddleware } from '../auth.js';

const router = Router();

const ALLOWED_ROLES = ['student', 'consultant'];

// Send SMS verification code
router.post('/send-sms', (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, error: '请输入正确的手机号' });
  }

  // Check rate limit: max 3 codes per 5 minutes per phone
  const recentCount = db.prepare(
    "SELECT COUNT(*) as c FROM sms_codes WHERE phone = ? AND created_at > datetime('now', '-5 minutes')"
  ).get(phone).c;
  if (recentCount >= 3) {
    return res.status(429).json({ success: false, error: '验证码发送过于频繁，请5分钟后再试' });
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  db.prepare(
    "INSERT INTO sms_codes (phone, code, expires_at) VALUES (?, ?, datetime('now', '+5 minutes'))"
  ).run(phone, code);

  console.log(`[SMS] 验证码发送到 ${phone}: ${code}`);

  // In production, send via SMS provider. For demo, return code in response.
  res.json({
    success: true,
    data: { phone, code, message: `验证码已发送到 ${phone}` },
  });
});

// Verify SMS code
router.post('/verify-sms', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ success: false, error: '手机号和验证码不能为空' });
  }

  const record = db.prepare(
    "SELECT * FROM sms_codes WHERE phone = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1"
  ).get(phone, code);

  if (!record) {
    return res.status(400).json({ success: false, error: '验证码错误或已过期' });
  }

  db.prepare('UPDATE sms_codes SET used = 1 WHERE id = ?').run(record.id);

  res.json({ success: true, data: { verified: true, phone } });
});

// Register
router.post('/register', (req, res) => {
  const {
    username, password, email, role = 'student',
    phone, province, undergraduate_school, grade, major_name, notes,
    sms_code,
  } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ success: false, error: '无效的角色' });
  }

  // Phone verification required
  if (!phone) {
    return res.status(400).json({ success: false, error: '手机号不能为空，请先验证手机号' });
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, error: '手机号格式不正确' });
  }

  // Verify SMS code was sent and verified (check for a used code within last 10 min)
  const verifiedSms = db.prepare(
    "SELECT * FROM sms_codes WHERE phone = ? AND used = 1 AND created_at > datetime('now', '-10 minutes') ORDER BY id DESC LIMIT 1"
  ).get(phone);
  if (!verifiedSms) {
    return res.status(400).json({ success: false, error: '请先验证手机号' });
  }

  // Check uniqueness
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    return res.status(400).json({ success: false, error: '用户名已存在' });
  }
  const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existingPhone) {
    return res.status(400).json({ success: false, error: '该手机号已被注册' });
  }
  if (email) {
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, error: '该邮箱已被注册' });
    }
  }

  const result = db.prepare(
    `INSERT INTO users (username, email, phone, province, undergraduate_school, grade, major_name, notes, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    username, email || null, phone, province || null, undergraduate_school || null,
    grade || null, major_name || null, notes || null, hashPassword(password), role,
  );

  // Also create user_profile entry for backward compatibility
  db.prepare(
    'INSERT INTO user_profiles (user_id, undergraduate) VALUES (?, ?)'
  ).run(result.lastInsertRowid, undergraduate_school || null);

  res.json({
    success: true,
    data: { id: result.lastInsertRowid, username, role, phone },
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ success: false, error: '用户名或密码错误' });
  }
  if (!user.is_active) {
    return res.status(403).json({ success: false, error: '账号已被禁用' });
  }

  const token = createToken(user);
  res.json({ success: true, data: { access_token: token, token_type: 'bearer' } });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare(
    'SELECT id, username, email, phone, province, undergraduate_school, grade, major_name, notes, role, is_active FROM users WHERE id = ?'
  ).get(req.user.sub);
  if (!user) return res.status(404).json({ success: false, error: '用户不存在' });

  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
  res.json({ success: true, data: { ...user, profile: profile || null } });
});

function serializeRegion(val) {
  if (val === undefined || val === null) return null;
  return typeof val === 'string' ? val : JSON.stringify(val);
}

router.put('/profile', authMiddleware, (req, res) => {
  const { undergraduate, gpa, target_major_id, target_region, target_tier, self_assessment } = req.body;
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.sub);
  const region = serializeRegion(target_region);

  if (profile) {
    db.prepare(`
      UPDATE user_profiles SET undergraduate=:ug, gpa=:gpa, target_major_id=:tmid,
      target_region=:tr, target_tier=:tt, self_assessment=:sa, updated_at=datetime('now')
      WHERE user_id=:uid
    `).run({
      ug: undergraduate ?? profile.undergraduate,
      gpa: gpa ?? profile.gpa,
      tmid: target_major_id ?? profile.target_major_id,
      tr: region ?? profile.target_region,
      tt: target_tier ?? profile.target_tier,
      sa: self_assessment ?? profile.self_assessment,
      uid: req.user.sub,
    });
  } else {
    db.prepare(`
      INSERT INTO user_profiles (user_id, undergraduate, gpa, target_major_id, target_region, target_tier, self_assessment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.sub,
      undergraduate ?? null,
      gpa ?? null,
      target_major_id ?? null,
      region,
      target_tier ?? null,
      self_assessment ?? null
    );
  }

  const updated = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.sub);
  res.json({ success: true, data: updated });
});

export default router;
