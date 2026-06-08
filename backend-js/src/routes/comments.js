import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../auth.js';

const router = Router();

// GET /api/v1/schools/:id/comments - 获取院校评论列表
router.get('/schools/:id/comments', (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.page_size) || 20, 100);
  const offset = (page - 1) * pageSize;

  const total = db.prepare('SELECT COUNT(*) as c FROM comments WHERE school_id = ?').get(id).c;
  const comments = db.prepare(`
    SELECT c.id, c.school_id, c.user_id, u.username, c.content, c.created_at
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.school_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).all(id, pageSize, offset);

  res.json({
    success: true,
    data: comments,
    pagination: { page, page_size: pageSize, total, total_pages: Math.ceil(total / pageSize) },
    error: null,
  });
});

// POST /api/v1/schools/:id/comments - 发表评论 (需要登录)
router.post('/schools/:id/comments', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, data: null, pagination: null, error: '评论内容不能为空' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ success: false, data: null, pagination: null, error: '评论内容不能超过1000字' });
  }

  // Verify school exists
  const school = db.prepare('SELECT id FROM schools WHERE id = ?').get(id);
  if (!school) {
    return res.status(404).json({ success: false, data: null, pagination: null, error: '院校不存在' });
  }

  const result = db.prepare(
    'INSERT INTO comments (school_id, user_id, content) VALUES (?, ?, ?)'
  ).run(id, req.user.sub, content.trim());

  const comment = db.prepare(`
    SELECT c.id, c.school_id, c.user_id, u.username, c.content, c.created_at
    FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: comment, pagination: null, error: null });
});

// DELETE /api/v1/comments/:id - 删除自己的评论
router.delete('/comments/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);

  if (!comment) {
    return res.status(404).json({ success: false, data: null, pagination: null, error: '评论不存在' });
  }
  if (comment.user_id !== req.user.sub && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, data: null, pagination: null, error: '只能删除自己的评论' });
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(id);
  res.json({ success: true, data: { deleted: true }, pagination: null, error: null });
});

export default router;
