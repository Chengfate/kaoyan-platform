import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/rankings', (req, res) => {
  const { major_id, year, limit = 20, sort_by = 'competition_ratio' } = req.query;
  const lim = Math.min(1000, Math.max(1, parseInt(limit) || 20));

  let query = `
    SELECT a.*, s.name as school_name, s.tier as school_tier, s.province as school_province,
           m.name as major_name, m.code as major_code, m.discipline
    FROM admission_data a
    JOIN schools s ON a.school_id = s.id
    JOIN majors m ON a.major_id = m.id
    WHERE 1=1
  `;
  const params = [];

  if (major_id) { query += ' AND a.major_id = ?'; params.push(parseInt(major_id)); }
  if (year) { query += ' AND a.year = ?'; params.push(parseInt(year)); }
  else { query += ' AND a.year = (SELECT MAX(year) FROM admission_data)'; }

  query += ` ORDER BY (a.total_applicants * 1.0 / MAX(a.admit_actual, 1)) DESC LIMIT ?`;
  params.push(lim);

  const rows = db.prepare(query).all(...params);
  const data = rows.map((r, i) => ({
    rank: i + 1,
    id: r.id,
    school_id: r.school_id,
    school_name: r.school_name,
    school_tier: r.school_tier,
    school_province: r.school_province,
    major_id: r.major_id,
    major_name: r.major_name,
    major_code: r.major_code,
    discipline: r.discipline,
    total_applicants: r.total_applicants,
    admit_actual: r.admit_actual,
    admit_plan: r.admit_plan,
    admit_exempt: r.admit_exempt,
    competition_ratio: r.admit_actual > 0 ? Math.round(r.total_applicants / r.admit_actual * 10) / 10 : 0,
    avg_admit_score: r.avg_admit_score,
    min_admit_score: r.min_admit_score,
    year: r.year,
  }));

  res.json({ success: true, data, pagination: null, error: null });
});

router.get('/competition/:school_id/:major_id', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM admission_data WHERE school_id = ? AND major_id = ? ORDER BY year ASC
  `).all(parseInt(req.params.school_id), parseInt(req.params.major_id));

  const data = rows.map(r => ({
    year: r.year,
    total_applicants: r.total_applicants,
    admit_actual: r.admit_actual,
    admit_exempt: r.admit_exempt,
    competition_ratio: r.admit_actual > 0 ? Math.round(r.total_applicants / r.admit_actual * 10) / 10 : 0,
    avg_admit_score: r.avg_admit_score,
    min_admit_score: r.min_admit_score,
  }));

  res.json({ success: true, data, pagination: null, error: null });
});

router.get('/', (req, res) => {
  const { year, school_id, major_id, page = 1, page_size = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(1000, Math.max(1, parseInt(page_size) || 20));

  let where = [];
  let params = {};

  if (year) { where.push('year = :year'); params.year = parseInt(year); }
  if (school_id) { where.push('school_id = :sid'); params.sid = parseInt(school_id); }
  if (major_id) { where.push('major_id = :mid'); params.mid = parseInt(major_id); }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) as total FROM admission_data ${whereClause}`).get(params).total;
  const offset = (pageNum - 1) * pageSize;

  const rows = db.prepare(`SELECT * FROM admission_data ${whereClause} ORDER BY year DESC LIMIT :limit OFFSET :offset`)
    .all({ ...params, limit: pageSize, offset });

  const data = rows.map(r => ({
    ...r,
    competition_ratio: r.admit_actual > 0 ? Math.round(r.total_applicants / r.admit_actual * 10) / 10 : 0,
  }));

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  res.json({ success: true, data, pagination: { page: pageNum, page_size: pageSize, total, total_pages: totalPages }, error: null });
});

export default router;
