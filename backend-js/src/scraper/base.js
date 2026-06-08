import db from '../database.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': randomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          ...opts.headers,
        },
        ...opts,
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep((i + 1) * 2000);
    }
  }
}

export function startLog(source) {
  const result = db.prepare(
    `INSERT INTO data_update_log (source, status, started_at) VALUES (?, 'running', datetime('now'))`
  ).run(source);
  return result.lastInsertRowid;
}

export function finishLog(logId, added = 0, updated = 0, error = null) {
  db.prepare(
    `UPDATE data_update_log SET status=?, records_added=?, records_updated=?, error_message=?, finished_at=datetime('now') WHERE id=?`
  ).run(error ? 'failed' : 'success', added, updated, error?.message?.substring(0, 500) || null, logId);
}

export { randomUA, sleep };
