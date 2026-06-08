import { Router } from 'express';
import db from '../database.js';
import { authMiddleware, adminMiddleware } from '../auth.js';
import { scrapeYanzhaoSchools, scrapeYanzhaoMajors } from '../scraper/yanzhao.js';
import { scrapeEOLScoreLines } from '../scraper/eol.js';
import { getSchedulerStatus } from '../scraper/scheduler.js';

function count(sql, ...params) {
  return db.prepare(sql).get(...params).c;
}

const router = Router();

// ==================== Stats (public) ====================

router.get('/stats', (req, res) => {
  const lastUpdate = db.prepare(
    "SELECT * FROM data_update_log WHERE status = 'success' ORDER BY finished_at DESC LIMIT 1"
  ).get();

  res.json({
    success: true,
    data: {
      total_schools: count('SELECT COUNT(*) as c FROM schools'),
      total_majors: count('SELECT COUNT(*) as c FROM majors'),
      total_score_lines: count('SELECT COUNT(*) as c FROM score_lines'),
      total_admissions: count('SELECT COUNT(*) as c FROM admission_data'),
      total_users: count('SELECT COUNT(*) as c FROM users'),
      last_update: lastUpdate?.finished_at || null,
      scheduler: getSchedulerStatus(),
    },
    pagination: null, error: null,
  });
});

// ==================== Scrape (admin only) ====================

router.get('/scrape/logs', authMiddleware, adminMiddleware, (req, res) => {
  const logs = db.prepare('SELECT * FROM data_update_log ORDER BY started_at DESC LIMIT 50').all();
  res.json({ success: true, data: logs, pagination: null, error: null });
});

router.post('/scrape/schools', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ success: true, data: { message: '院校数据抓取已触发' }, pagination: null, error: null });
  scrapeYanzhaoSchools();
});

router.post('/scrape/majors', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ success: true, data: { message: '专业数据抓取已触发' }, pagination: null, error: null });
  scrapeYanzhaoMajors();
});

router.post('/scrape/score-lines', authMiddleware, adminMiddleware, async (req, res) => {
  const year = req.body?.year || new Date().getFullYear();
  res.json({ success: true, data: { message: `${year}年国家线抓取已触发` }, pagination: null, error: null });
  scrapeEOLScoreLines(year);
});

// ==================== User Management (admin only) ====================

router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  const search = req.query.search || '';
  const role = req.query.role;
  const status = req.query.status;
  const page = parseInt(req.query.page) || 1;
  const size = Math.min(parseInt(req.query.page_size) || 30, 100);

  let where = '';
  const params = [];
  if (search) {
    where += ' WHERE (u.username LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (role && role !== 'all') {
    where += `${where ? ' AND' : ' WHERE'} u.role = ?`;
    params.push(role);
  }
  if (status === 'active') {
    where += `${where ? ' AND' : ' WHERE'} u.is_active = 1`;
  } else if (status === 'inactive') {
    where += `${where ? ' AND' : ' WHERE'} u.is_active = 0`;
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM users u${where}`).get(...params).c;

  const rows = db.prepare(`
    SELECT u.id, u.username, u.email, u.phone, u.province, u.undergraduate_school,
           u.grade, u.major_name, u.notes, u.role, u.is_active, u.created_at,
           up.gpa, up.target_major_id,
           (SELECT COUNT(*) FROM visits WHERE user_id = u.id) as visit_count,
           (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comment_count,
           (SELECT COUNT(*) FROM recommendations WHERE user_id = u.id) as rec_count,
           (SELECT MAX(created_at) FROM visits WHERE user_id = u.id) as last_visit
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    ${where}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, size, (page - 1) * size);

  res.json({
    success: true,
    data: rows,
    pagination: { page, page_size: size, total, total_pages: Math.ceil(total / size) },
  });
});

router.get('/users/stats', authMiddleware, adminMiddleware, (req, res) => {
  const total = count('SELECT COUNT(*) as c FROM users');
  const active = count('SELECT COUNT(*) as c FROM users WHERE is_active = 1');
  const students = count("SELECT COUNT(*) as c FROM users WHERE role = 'student'");
  const consultants = count("SELECT COUNT(*) as c FROM users WHERE role = 'consultant'");
  const admins = count("SELECT COUNT(*) as c FROM users WHERE role = 'admin'");
  const today = count("SELECT COUNT(*) as c FROM users WHERE date(created_at) = date('now','localtime')");

  res.json({
    success: true,
    data: { total, active, inactive: total - active, students, consultants, admins, today },
  });
});

router.get('/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const user = db.prepare(`
    SELECT u.*, up.gpa, up.target_major_id, up.target_region, up.target_tier, up.self_assessment
    FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE u.id = ?
  `).get(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: '用户不存在' });

  const visits = db.prepare(
    'SELECT * FROM visits WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.params.id);
  const comments = db.prepare(
    'SELECT c.*, s.name as school_name FROM comments c JOIN schools s ON s.id = c.school_id WHERE c.user_id = ? ORDER BY c.created_at DESC'
  ).all(req.params.id);

  res.json({ success: true, data: { ...user, visits, comments } });
});

// Toggle user active status
router.put('/users/:id/toggle', authMiddleware, adminMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: '用户不存在' });
  if (user.role === 'admin') return res.status(403).json({ success: false, error: '不能禁用管理员账户' });

  const newStatus = user.is_active ? 0 : 1;
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({
    success: true,
    data: { id: user.id, is_active: !!newStatus, message: newStatus ? '用户已启用' : '用户已禁用' },
  });
});

// Delete user
router.delete('/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: '用户不存在' });
  if (user.role === 'admin') return res.status(403).json({ success: false, error: '不能删除管理员账户' });

  db.prepare('DELETE FROM user_profiles WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM recommendations WHERE user_id = ?').run(req.params.id);
  db.prepare('UPDATE comments SET user_id = NULL WHERE user_id = ?').run(req.params.id);
  db.prepare('UPDATE visits SET user_id = NULL WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

  res.json({ success: true, data: { deleted: true, id: parseInt(req.params.id) } });
});

export default router;
