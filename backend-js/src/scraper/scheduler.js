import cron from 'node-cron';
import db from '../database.js';
import { scrapeYanzhaoSchools, scrapeYanzhaoMajors } from './yanzhao.js';
import { scrapeEOLScoreLines } from './eol.js';

let jobs = [];

export function startScheduler() {
  console.log('[调度器] 初始化定时任务...');

  // 每周日凌晨 2:00 抓取院校数据 (避开高峰)
  jobs.push(cron.schedule('0 2 * * 0', () => {
    console.log('[调度器] 执行周度院校数据更新...');
    scrapeYanzhaoSchools();
  }));

  // 每月1号凌晨 3:00 更新专业目录
  jobs.push(cron.schedule('0 3 1 * *', () => {
    console.log('[调度器] 执行月度专业目录更新...');
    scrapeYanzhaoMajors();
  }));

  // 每年3月15日-4月30日每天凌晨 4:00 抓取当年国家线 (录取季高频更新)
  jobs.push(cron.schedule('0 4 * 3,4 *', () => {
    const year = new Date().getFullYear();
    console.log(`[调度器] 执行${year}年国家线更新...`);
    scrapeEOLScoreLines(year);
  }));

  // 每天凌晨 5:00 检查是否需要更新最新年份数据
  jobs.push(cron.schedule('0 5 * * *', () => {
    const year = new Date().getFullYear();
    const existing = db.prepare(
      'SELECT COUNT(*) as c FROM score_lines WHERE year = ?'
    ).get(year);
    if (existing.c === 0) {
      console.log(`[调度器] 检测到${year}年数据缺失，执行更新...`);
      scrapeEOLScoreLines(year);
    }
  }));

  console.log(`[调度器] 已注册 ${jobs.length} 个定时任务`);
}

export function stopScheduler() {
  jobs.forEach(j => j.stop());
  jobs = [];
  console.log('[调度器] 所有定时任务已停止');
}

export function getSchedulerStatus() {
  return {
    running: jobs.length > 0,
    jobCount: jobs.length,
  };
}
