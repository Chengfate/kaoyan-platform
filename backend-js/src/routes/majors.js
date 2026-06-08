import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const { discipline, degree_type, keyword, page = 1, page_size = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(1000, Math.max(1, parseInt(page_size) || 20));

  let where = [];
  let params = {};

  if (discipline) { where.push('discipline = :discipline'); params.discipline = discipline; }
  if (degree_type) { where.push('degree_type = :degree_type'); params.degree_type = degree_type; }
  if (keyword) { where.push('(name LIKE :kw OR code LIKE :kw)'); params.kw = `%${keyword}%`; }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) as total FROM majors ${whereClause}`).get(params).total;
  const offset = (pageNum - 1) * pageSize;

  const majors = db.prepare(`SELECT * FROM majors ${whereClause} ORDER BY code LIMIT :limit OFFSET :offset`)
    .all({ ...params, limit: pageSize, offset });

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  res.json({ success: true, data: majors, pagination: { page: pageNum, page_size: pageSize, total, total_pages: totalPages }, error: null });
});

router.get('/:id', (req, res) => {
  const major = db.prepare('SELECT * FROM majors WHERE id = ?').get(req.params.id);
  if (!major) return res.status(404).json({ success: false, error: '专业不存在' });
  res.json({ success: true, data: major, pagination: null, error: null });
});

router.get('/:id/schools', (req, res) => {
  const rows = db.prepare(`
    SELECT sm.id as school_major_id, s.id as school_id, s.name as school_name, s.code as school_code,
           s.tier, s.province, sm.department, sm.research_directions, sm.exam_subjects
    FROM school_majors sm
    JOIN schools s ON sm.school_id = s.id
    WHERE sm.major_id = ?
  `).all(req.params.id);
  res.json({ success: true, data: rows, pagination: null, error: null });
});

// GET /difficulty — 专业难易程度聚合排名
router.get('/difficulty/overview', (req, res) => {
  const { year } = req.query;
  const targetYear = parseInt(year) || new Date().getFullYear() - 1;

  const rows = db.prepare(`
    SELECT
      m.id, m.code, m.name, m.discipline, m.degree_type,
      COUNT(DISTINCT sm.school_id) as school_count,
      ROUND(AVG(CASE WHEN ad.admit_actual > 0 THEN ad.total_applicants * 1.0 / ad.admit_actual ELSE NULL END), 1) as avg_ratio,
      ROUND(AVG(sl.total_score), 0) as avg_score,
      MAX(sl.total_score) as max_score,
      MIN(sl.total_score) as min_score
    FROM majors m
    JOIN school_majors sm ON sm.major_id = m.id
    LEFT JOIN admission_data ad ON ad.major_id = m.id AND ad.school_id = sm.school_id AND ad.year = ?
    LEFT JOIN score_lines sl ON sl.major_id = m.id AND sl.school_id = sm.school_id AND sl.year = ? AND sl.line_type = '院校复试线'
    GROUP BY m.id
    HAVING school_count >= 3
    ORDER BY avg_ratio DESC NULLS LAST
  `).all(targetYear, targetYear);

  // Compute difficulty tier: S(95+) A(85-94) B(70-84) C(50-69) D(0-49)
  const data = rows.map(r => {
    const scoreNorm = r.avg_score ? Math.min(100, (r.avg_score - 250) / 2) : 50;
    const ratioNorm = r.avg_ratio ? Math.min(100, r.avg_ratio / 0.3) : 50;
    const difficulty = Math.round(scoreNorm * 0.4 + ratioNorm * 0.6);
    let tier;
    if (difficulty >= 90) tier = 'S';
    else if (difficulty >= 75) tier = 'A';
    else if (difficulty >= 55) tier = 'B';
    else if (difficulty >= 35) tier = 'C';
    else tier = 'D';
    return { ...r, difficulty, tier };
  });

  // Sort by difficulty descending
  data.sort((a, b) => b.difficulty - a.difficulty);

  res.json({ success: true, data, pagination: null, error: null });
});

router.get('/:id/national-lines', (req, res) => {
  const { years } = req.query;
  let query = `SELECT * FROM score_lines WHERE school_id IS NULL AND major_id = ? AND line_type IN ('国家线A区','国家线B区')`;
  const params = [req.params.id];

  if (years) {
    const yearList = years.split(',').map(y => parseInt(y.trim()));
    query += ` AND year IN (${yearList.map(() => '?').join(',')})`;
    params.push(...yearList);
  }

  const lines = db.prepare(query + ' ORDER BY year ASC').all(...params);
  const trend = {};
  for (const sl of lines) {
    if (!trend[sl.year]) trend[sl.year] = { year: sl.year, 'A区': null, 'B区': null };
    trend[sl.year][sl.line_type.includes('A区') ? 'A区' : 'B区'] = sl.total_score;
  }
  res.json({ success: true, data: Object.values(trend), pagination: null, error: null });
});

export default router;
