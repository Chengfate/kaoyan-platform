import { Router } from 'express';
import db from '../database.js';

const router = Router();

function paginated(data, total, page, pageSize) {
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  return {
    success: true,
    data,
    pagination: { page, page_size: pageSize, total, total_pages: totalPages },
    error: null,
  };
}

router.get('/', (req, res) => {
  const { province, tier, category, keyword, page = 1, page_size = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(1000, Math.max(1, parseInt(page_size) || 20));

  let where = [];
  let params = {};

  if (province) {
    const provinces = province.split(',').map(p => p.trim());
    where.push(`s.province IN (${provinces.map((_, i) => `:p${i}`).join(',')})`);
    provinces.forEach((p, i) => params[`p${i}`] = p);
  }
  if (tier) {
    const tiers = tier.split(',').map(t => t.trim());
    where.push(`s.tier IN (${tiers.map((_, i) => `:t${i}`).join(',')})`);
    tiers.forEach((t, i) => params[`t${i}`] = t);
  }
  if (category) {
    const cats = category.split(',').map(c => c.trim());
    where.push(`s.category IN (${cats.map((_, i) => `:c${i}`).join(',')})`);
    cats.forEach((c, i) => params[`c${i}`] = c);
  }
  if (keyword) {
    where.push('(s.name LIKE :kw OR s.short_name LIKE :kw)');
    params.kw = `%${keyword}%`;
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM schools s ${whereClause}`).get(params);
  const total = countRow.total;

  const offset = (pageNum - 1) * pageSize;
  const schools = db.prepare(`
    SELECT s.*, (SELECT COUNT(*) FROM school_majors sm WHERE sm.school_id = s.id) as major_count
    FROM schools s ${whereClause}
    ORDER BY CASE s.tier WHEN '985' THEN 1 WHEN '211' THEN 2 WHEN '双一流' THEN 3 WHEN '普通一本' THEN 4 ELSE 5 END, s.name
    LIMIT :limit OFFSET :offset
  `).all({ ...params, limit: pageSize, offset });

  res.json(paginated(schools, total, pageNum, pageSize));
});

router.get('/:id', (req, res) => {
  const school = db.prepare(`
    SELECT s.*, (SELECT COUNT(*) FROM school_majors sm WHERE sm.school_id = s.id) as major_count
    FROM schools s WHERE s.id = ?
  `).get(req.params.id);

  if (!school) return res.status(404).json({ success: false, error: '院校不存在' });
  res.json({ success: true, data: school, pagination: null, error: null });
});

router.get('/:id/majors', (req, res) => {
  const rows = db.prepare(`
    SELECT sm.*, m.name as major_name, m.code as major_code, m.discipline, m.degree_type
    FROM school_majors sm
    JOIN majors m ON sm.major_id = m.id
    WHERE sm.school_id = ?
  `).all(req.params.id);
  res.json({ success: true, data: rows, pagination: null, error: null });
});

// GET /:id/majors-detail — 专业+分数线+报录数据合并视图
router.get('/:id/majors-detail', (req, res) => {
  const schoolId = req.params.id;

  const majors = db.prepare(`
    SELECT sm.id as school_major_id, sm.major_id, m.code as major_code, m.name as major_name,
           m.discipline, m.degree_type, sm.department
    FROM school_majors sm
    JOIN majors m ON sm.major_id = m.id
    WHERE sm.school_id = ?
    ORDER BY m.discipline, m.code
  `).all(schoolId);

  const scoreLines = db.prepare(`
    SELECT * FROM score_lines
    WHERE school_id = ? OR (school_id IS NULL AND major_id IN (SELECT major_id FROM school_majors WHERE school_id = ?))
  `).all(schoolId, schoolId);

  const admissions = db.prepare(`
    SELECT * FROM admission_data WHERE school_id = ?
  `).all(schoolId);

  // Merge: for each major, collect all years that have data
  const rows = [];
  for (const m of majors) {
    const majorLines = scoreLines.filter(sl => sl.major_id === m.major_id);
    const majorAdms = admissions.filter(ad => ad.major_id === m.major_id);

    const years = new Set([
      ...majorLines.map(sl => sl.year),
      ...majorAdms.map(ad => ad.year),
    ]);

    const sortedYears = [...years].sort((a, b) => b - a);

    if (sortedYears.length === 0) {
      rows.push({
        school_major_id: m.school_major_id,
        major_id: m.major_id,
        major_code: m.major_code,
        major_name: m.major_name,
        discipline: m.discipline,
        degree_type: m.degree_type,
        department: m.department,
        year: null,
        line_type: null,
        total_score: null,
        politics: null,
        english: null,
        math: null,
        major_course: null,
        competition_ratio: null,
        total_applicants: null,
        admit_actual: null,
        admit_exempt: null,
        avg_admit_score: null,
        min_admit_score: null,
      });
    } else {
      for (const year of sortedYears) {
        const sl = majorLines.find(l => l.year === year);
        const ad = majorAdms.find(a => a.year === year);
        rows.push({
          school_major_id: m.school_major_id,
          major_id: m.major_id,
          major_code: m.major_code,
          major_name: m.major_name,
          discipline: m.discipline,
          degree_type: m.degree_type,
          department: m.department,
          year,
          line_type: sl?.line_type || null,
          total_score: sl?.total_score || null,
          politics: sl?.politics || null,
          english: sl?.english || null,
          math: sl?.math || null,
          major_course: sl?.['专业课'] || null,
          competition_ratio: ad ? (ad.admit_actual > 0 ? +(ad.total_applicants / ad.admit_actual).toFixed(1) : null) : null,
          total_applicants: ad?.total_applicants || null,
          admit_actual: ad?.admit_actual || null,
          admit_exempt: ad?.admit_exempt || null,
          avg_admit_score: ad?.avg_admit_score || null,
          min_admit_score: ad?.min_admit_score || null,
        });
      }
    }
  }

  res.json({ success: true, data: rows, pagination: null, error: null });
});

export default router;
