import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import { authMiddleware, adminMiddleware } from '../auth.js';

const router = Router();
const SECRET = 'kaoyan-platform-secret-change-in-production';

// Record a page visit (public)
router.post('/', (req, res) => {
  const { page } = req.body;
  if (!page) return res.status(400).json({ success: false, error: 'page is required' });

  const ip = req.ip || req.socket?.remoteAddress || '';
  const ua = (req.headers['user-agent'] || '').slice(0, 500);

  let userId = null;
  let username = null;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.split(' ')[1], SECRET);
      userId = payload.sub;
      const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
      if (user) username = user.username;
    } catch { /* token invalid or expired, still record the visit */ }
  }

  db.prepare('INSERT INTO visits (user_id, username, page, ip, user_agent) VALUES (?, ?, ?, ?, ?)')
    .run(userId, username, page, ip, ua);
  res.json({ success: true, data: { recorded: true } });
});

// Admin: list visits with filtering
router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = Math.min(parseInt(req.query.page_size) || 50, 200);
  const filterUser = req.query.username || '';
  const filterPage = req.query.page_filter || '';

  let where = '';
  const params = [];
  if (filterUser) {
    where += ' WHERE v.username LIKE ?';
    params.push(`%${filterUser}%`);
  }
  if (filterPage) {
    where += `${where ? ' AND' : ' WHERE'} v.page LIKE ?`;
    params.push(`%${filterPage}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM visits v${where}`).get(...params).c;
  const rows = db.prepare(
    `SELECT v.* FROM visits v${where} ORDER BY v.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, size, (page - 1) * size);

  res.json({
    success: true,
    data: rows,
    pagination: { page, page_size: size, total, total_pages: Math.ceil(total / size) },
  });
});

// Admin: visit stats summary
router.get('/stats', authMiddleware, adminMiddleware, (req, res) => {
  const totalVisits = db.prepare('SELECT COUNT(*) as c FROM visits').get().c;
  const uniqueIps = db.prepare('SELECT COUNT(DISTINCT ip) as c FROM visits').get().c;
  const todayVisits = db.prepare(
    "SELECT COUNT(*) as c FROM visits WHERE date(created_at) = date('now','localtime')"
  ).get().c;
  const topPages = db.prepare(
    'SELECT page, COUNT(*) as count FROM visits GROUP BY page ORDER BY count DESC LIMIT 10'
  ).all();
  const hourly = db.prepare(`
    SELECT substr(created_at, 12, 2) as hour, COUNT(*) as count
    FROM visits WHERE date(created_at) = date('now','localtime')
    GROUP BY hour ORDER BY hour
  `).all();

  res.json({
    success: true,
    data: { totalVisits, uniqueIps, todayVisits, topPages, hourly },
  });
});

export default router;
