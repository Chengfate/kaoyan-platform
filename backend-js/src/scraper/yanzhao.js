import * as cheerio from 'cheerio';
import db from '../database.js';
import { fetchWithRetry, startLog, finishLog } from './base.js';

const YZ_BASE = 'https://yz.chsi.com.cn';

export async function scrapeYanzhaoSchools() {
  const logId = startLog('研招网-院校库');
  let added = 0;
  let updated = 0;

  try {
    // 研招网院校库列表页
    const res = await fetchWithRetry(`${YZ_BASE}/sch/search.do?ssdm=&billion=`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const schools = [];
    $('.sch-item').each((i, el) => {
      const name = $(el).find('.sch-name').text().trim();
      const province = $(el).find('.sch-address').text().trim();
      if (name && province) {
        schools.push({ name, province });
      }
    });

    if (schools.length > 0) {
      for (const s of schools) {
        const existing = db.prepare('SELECT id FROM schools WHERE name = ?').get(s.name);
        if (existing) {
          db.prepare('UPDATE schools SET province = ?, updated_at = datetime(\'now\') WHERE id = ?')
            .run(s.province, existing.id);
          updated++;
        } else {
          added++;
        }
      }
    }

    finishLog(logId, added, updated);
    console.log(`[研招网] 抓取完成: 新增${added}所, 更新${updated}所`);
  } catch (e) {
    finishLog(logId, added, updated, e);
    console.error('[研招网] 抓取失败:', e.message);
  }
}

export async function scrapeYanzhaoMajors() {
  const logId = startLog('研招网-专业目录');
  let added = 0;

  try {
    const res = await fetchWithRetry(`${YZ_BASE}/zyk/specialitySearch.do?method=ajaxSearch`);
    const html = await res.text();
    const $ = cheerio.load(html);

    $('.zyk-item').each((i, el) => {
      const code = $(el).find('.code').text().trim();
      const name = $(el).find('.name').text().trim();
      if (!code || !name) return;

      const existing = db.prepare('SELECT id FROM majors WHERE code = ?').get(code);
      if (!existing) {
        const discipline = code.substring(0, 4);
        db.prepare(
          'INSERT OR IGNORE INTO majors (code, name, discipline, category, degree_type) VALUES (?, ?, ?, ?, ?)'
        ).run(code, name, discipline, '学术学位', '学术型硕士');
        added++;
      }
    });

    finishLog(logId, added, 0);
    console.log(`[研招网] 专业抓取完成: 新增${added}个`);
  } catch (e) {
    finishLog(logId, added, 0, e);
    console.error('[研招网] 专业抓取失败:', e.message);
  }
}
