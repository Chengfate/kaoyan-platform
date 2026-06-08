import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../auth.js';

const router = Router();

const TIER_SCORE = { '985': 100, '211': 80, '双一流': 70, '普通一本': 50, '二本': 30, '其他': 15 };

router.post('/generate', authMiddleware, (req, res) => {
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.sub);
  if (!profile?.target_major_id) {
    return res.status(422).json({ success: false, error: '请先完善个人资料，至少选择意向专业' });
  }

  const targetMajor = db.prepare('SELECT * FROM majors WHERE id = ?').get(profile.target_major_id);
  if (!targetMajor) return res.status(404).json({ success: false, error: '意向专业不存在' });

  const targetRegions = profile.target_region ? JSON.parse(profile.target_region) : [];
  const targetTiers = profile.target_tier ? JSON.parse(profile.target_tier) : [];

  let candidateQuery = `
    SELECT sm.*, s.name as school_name, s.tier as school_tier, s.province as school_province,
           s.is_self_rated, m.id as major_id, m.name as major_name, m.code as major_code
    FROM school_majors sm
    JOIN schools s ON sm.school_id = s.id
    JOIN majors m ON sm.major_id = m.id
  `;
  const params = [];

  if (targetTiers.length) {
    candidateQuery += ` WHERE s.tier IN (${targetTiers.map(() => '?').join(',')})`;
    params.push(...targetTiers);
  }

  const candidates = db.prepare(candidateQuery).all(...params);

  const scored = [];
  for (const c of candidates) {
    // Major match
    const majorMatch = c.major_code === targetMajor.code ? 100 :
      c.major_code.slice(0, 4) === targetMajor.code.slice(0, 4) ? 85 :
      c.major_code.slice(0, 2) === targetMajor.code.slice(0, 2) ? 60 : 30;
    if (majorMatch < 30) continue;

    // School strength
    const strength = Math.min(100, (TIER_SCORE[c.school_tier] || 30) + (c.is_self_rated ? 5 : 0));

    // Region match
    let regionMatch = 60;
    if (targetRegions.includes(c.school_province)) regionMatch = 100;
    else if (targetRegions.length > 0) regionMatch = 30;

    // Admit probability
    const admitRows = db.prepare(`
      SELECT * FROM admission_data WHERE school_id = ? AND major_id = ? ORDER BY year DESC LIMIT 3
    `).all(c.school_id, c.major_id);

    let admitProb = 50;
    if (admitRows.length && profile.gpa) {
      const ratios = admitRows.filter(a => a.admit_actual > 0).map(a => a.total_applicants / a.admit_actual);
      const avgRatio = ratios.length ? ratios.reduce((s, r) => s + r, 0) / ratios.length : 5;
      const scores = admitRows.filter(a => a.avg_admit_score).map(a => a.avg_admit_score);
      const avgScore = scores.length ? scores.reduce((s, sc) => s + sc, 0) / scores.length : 300;
      const estScore = 280 + (profile.gpa / 4.0) * 120;
      admitProb = Math.max(5, Math.min(95, 50 + (estScore - avgScore) * 1.5));
      if (avgRatio > 10) admitProb -= 10;
      else if (avgRatio > 5) admitProb -= 5;
    }

    // Career prospect
    const career = Math.min(100, (TIER_SCORE[c.school_tier] || 30) * 0.5 + 20);

    const total = strength * 0.25 + majorMatch * 0.25 + admitProb * 0.30 + regionMatch * 0.10 + career * 0.10;
    scored.push({
      school_major_id: c.id,
      school_id: c.school_id,
      school_name: c.school_name,
      school_tier: c.school_tier,
      school_province: c.school_province,
      major_id: c.major_id,
      major_name: c.major_name,
      major_code: c.major_code,
      department: c.department,
      total_score: Math.round(total * 100) / 100,
      factors: {
        school_strength: Math.round(strength * 10) / 10,
        major_match: Math.round(majorMatch * 10) / 10,
        admit_probability: Math.round(admitProb * 10) / 10,
        region_match: Math.round(regionMatch * 10) / 10,
        career_prospect: Math.round(career * 10) / 10,
      },
    });
  }

  scored.sort((a, b) => b.total_score - a.total_score);
  const top = scored.slice(0, 15);

  const insert = db.prepare(`
    INSERT INTO recommendations (user_id, school_major_id, score, rank, factors_json, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);

  const deleteOld = db.prepare('DELETE FROM recommendations WHERE user_id = ?');
  db.exec('BEGIN');
  try {
    deleteOld.run(req.user.sub);
    top.forEach((item, i) => {
      insert.run(req.user.sub, item.school_major_id, item.total_score, i + 1, JSON.stringify(item.factors));
    });
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  top.forEach((item, i) => { item.rank = i + 1; });
  res.json({ success: true, data: top, pagination: null, error: null });
});

router.get('/', authMiddleware, (req, res) => {
  const recs = db.prepare(`
    SELECT r.*, s.name as school_name, s.tier as school_tier, m.name as major_name
    FROM recommendations r
    JOIN school_majors sm ON r.school_major_id = sm.id
    JOIN schools s ON sm.school_id = s.id
    JOIN majors m ON sm.major_id = m.id
    WHERE r.user_id = ?
    ORDER BY r.score DESC
  `).all(req.user.sub);

  const data = recs.map(r => ({
    ...r,
    factors: r.factors_json ? JSON.parse(r.factors_json) : {},
  }));
  res.json({ success: true, data, pagination: null, error: null });
});

export default router;
