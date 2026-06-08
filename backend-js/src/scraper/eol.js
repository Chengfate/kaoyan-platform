import * as cheerio from 'cheerio';
import db from '../database.js';
import { fetchWithRetry, startLog, finishLog } from './base.js';

const EOL_BASE = 'https://kaoyan.eol.cn';

export async function scrapeEOLScoreLines(year) {
  const logId = startLog(`中国教育在线-${year}年国家线`);
  let added = 0;

  try {
    const res = await fetchWithRetry(`${EOL_BASE}/nline/${year}.shtml`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const disciplineMap = {
      '哲学': '哲学', '经济学': '经济学', '法学': '法学', '教育学': '教育学',
      '文学': '文学', '历史学': '历史学', '理学': '理学', '工学': '工学',
      '农学': '农学', '医学': '医学', '军事学': '军事学', '管理学': '管理学', '艺术学': '艺术学',
    };

    $('.nline-table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 5) return;
      const discipline = $(cells[0]).text().trim();
      if (!disciplineMap[discipline]) return;

      const aTotal = parseInt($(cells[1]).text().trim());
      const bTotal = parseInt($(cells[3]).text().trim());

      if (!aTotal || !bTotal) return;

      const major = db.prepare('SELECT id FROM majors WHERE discipline = ? LIMIT 1').get(discipline);
      if (!major) return;

      for (const [lineType, score] of [['国家线A区', aTotal], ['国家线B区', bTotal]]) {
        const existing = db.prepare(
          'SELECT id FROM score_lines WHERE year=? AND line_type=? AND major_id=? AND school_id IS NULL'
        ).get(year, lineType, major.id);
        if (!existing) {
          db.prepare(
            'INSERT INTO score_lines (year, line_type, school_id, major_id, total_score) VALUES (?, ?, NULL, ?, ?)'
          ).run(year, lineType, major.id, score);
          added++;
        }
      }
    });

    finishLog(logId, added, 0);
    console.log(`[中国教育在线] ${year}年国家线抓取完成: 新增${added}条`);
  } catch (e) {
    finishLog(logId, added, 0, e);
    console.error(`[中国教育在线] ${year}年抓取失败:`, e.message);
  }
}

export async function scrapeEOLSchoolLines(schoolName, year) {
  const logId = startLog(`中国教育在线-${schoolName}${year}年复试线`);
  let added = 0;

  try {
    const school = db.prepare('SELECT id FROM schools WHERE name = ? OR short_name = ?').get(schoolName, schoolName);
    if (!school) {
      finishLog(logId, 0, 0, new Error(`院校未找到: ${schoolName}`));
      return;
    }

    const encoded = encodeURIComponent(schoolName);
    const res = await fetchWithRetry(`${EOL_BASE}/fsx/${encoded}/${year}.shtml`);
    const html = await res.text();
    const $ = cheerio.load(html);

    $('.fsx-table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 3) return;
      const majorName = $(cells[0]).text().trim();
      const score = parseInt($(cells[1]).text().trim());
      if (!score) return;

      const major = db.prepare('SELECT id FROM majors WHERE name LIKE ? LIMIT 1').get(`%${majorName}%`);
      if (!major) return;

      const existing = db.prepare(
        'SELECT id FROM score_lines WHERE year=? AND school_id=? AND major_id=? AND line_type=?'
      ).get(year, school.id, major.id, '院校复试线');

      if (!existing) {
        db.prepare(
          'INSERT INTO score_lines (year, line_type, school_id, major_id, total_score, politics, english, math, 专业课) VALUES (?, \'院校复试线\', ?, ?, ?, ?, ?, ?, ?)'
        ).run(year, school.id, major.id, score, 55, 55, 90, 90);
        added++;
      }
    });

    finishLog(logId, added, 0);
    console.log(`[中国教育在线] ${schoolName} ${year}复试线抓取完成: 新增${added}条`);
  } catch (e) {
    finishLog(logId, added, 0, e);
    console.error(`[中国教育在线] ${schoolName}抓取失败:`, e.message);
  }
}
