import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const { year, school_id, major_id, line_type, page = 1, page_size = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(1000, Math.max(1, parseInt(page_size) || 20));

  let where = [];
  let params = {};

  if (year) { where.push('year = :year'); params.year = parseInt(year); }
  if (school_id) { where.push('school_id = :school_id'); params.school_id = parseInt(school_id); }
  if (major_id) { where.push('major_id = :major_id'); params.major_id = parseInt(major_id); }
  if (line_type) { where.push('line_type = :line_type'); params.line_type = line_type; }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) as total FROM score_lines ${whereClause}`).get(params).total;
  const offset = (pageNum - 1) * pageSize;

  const lines = db.prepare(`SELECT * FROM score_lines ${whereClause} ORDER BY year DESC LIMIT :limit OFFSET :offset`)
    .all({ ...params, limit: pageSize, offset });

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  res.json({ success: true, data: lines, pagination: { page: pageNum, page_size: pageSize, total, total_pages: totalPages }, error: null });
});

router.post('/compare', (req, res) => {
  const { school_ids, major_id, years } = req.body;
  if (!school_ids?.length || !major_id) {
    return res.status(400).json({ success: false, error: '请提供school_ids和major_id' });
  }

  let query = `
    SELECT sl.*, s.name as school_name, s.tier, s.province, m.name as major_name
    FROM score_lines sl
    JOIN schools s ON sl.school_id = s.id
    JOIN majors m ON sl.major_id = m.id
    WHERE sl.school_id IN (${school_ids.map(() => '?').join(',')})
    AND sl.major_id = ?
  `;
  const params = [...school_ids, major_id];

  if (years?.length) {
    query += ` AND sl.year IN (${years.map(() => '?').join(',')})`;
    params.push(...years);
  }

  const rows = db.prepare(query).all(...params);

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.school_id]) {
      grouped[row.school_id] = {
        school_id: row.school_id, school_name: row.school_name,
        tier: row.tier, province: row.province, major_name: row.major_name,
        score_lines: [],
      };
    }
    grouped[row.school_id].score_lines.push({
      year: row.year, line_type: row.line_type, total_score: row.total_score,
      politics: row.politics, english: row.english, math: row.math, 专业课: row.专业课,
    });
  }

  res.json({ success: true, data: Object.values(grouped), pagination: null, error: null });
});

router.get('/trend', (req, res) => {
  const { school_id, major_id, years } = req.query;
  if (!major_id) return res.status(400).json({ success: false, error: '请提供major_id' });

  let query;
  let params;

  if (school_id) {
    query = 'SELECT * FROM score_lines WHERE school_id = ? AND major_id = ?';
    params = [parseInt(school_id), parseInt(major_id)];
    if (years) {
      const yl = years.split(',').map(y => parseInt(y.trim()));
      query += ` AND year IN (${yl.map(() => '?').join(',')})`;
      params.push(...yl);
    }
    query += ' ORDER BY year DESC';
  } else {
    query = `SELECT * FROM score_lines WHERE school_id IS NULL AND major_id = ? AND line_type IN ('国家线A区','国家线B区')`;
    params = [parseInt(major_id)];
    if (years) {
      const yl = years.split(',').map(y => parseInt(y.trim()));
      query += ` AND year IN (${yl.map(() => '?').join(',')})`;
      params.push(...yl);
    }
    query += ' ORDER BY year ASC';
    const lines = db.prepare(query).all(...params);
    const trend = {};
    for (const sl of lines) {
      if (!trend[sl.year]) trend[sl.year] = { year: sl.year, 'A区': null, 'B区': null };
      trend[sl.year][sl.line_type.includes('A区') ? 'A区' : 'B区'] = sl.total_score;
    }
    return res.json({ success: true, data: Object.values(trend), pagination: null, error: null });
  }

  res.json({ success: true, data: db.prepare(query).all(...params), pagination: null, error: null });
});

export default router;
