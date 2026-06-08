import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'kaoyan.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON');

export function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, short_name TEXT, code TEXT UNIQUE NOT NULL,
      province TEXT NOT NULL, city TEXT,
      tier TEXT NOT NULL, category TEXT NOT NULL,
      is_self_rated INTEGER DEFAULT 0, website TEXT, description TEXT, logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS majors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      discipline TEXT NOT NULL, category TEXT NOT NULL,
      degree_type TEXT DEFAULT '学术型硕士', description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS school_majors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      major_id INTEGER NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
      department TEXT, research_directions TEXT, exam_subjects TEXT,
      UNIQUE(school_id, major_id)
    );
    CREATE TABLE IF NOT EXISTS score_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL, line_type TEXT NOT NULL,
      school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
      major_id INTEGER NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
      total_score REAL NOT NULL, politics REAL, english REAL, math REAL,
      专业课 REAL, source TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS admission_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      major_id INTEGER NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
      total_applicants INTEGER DEFAULT 0, admit_plan INTEGER DEFAULT 0,
      admit_actual INTEGER DEFAULT 0, admit_exempt INTEGER DEFAULT 0,
      retest_line REAL, retest_ratio REAL, avg_admit_score REAL, min_admit_score REAL,
      source TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(school_id, major_id, year)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL, email TEXT UNIQUE,
      phone TEXT UNIQUE, province TEXT, undergraduate_school TEXT,
      grade TEXT, major_name TEXT, notes TEXT,
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student',
      is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sms_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL, code TEXT NOT NULL,
      expires_at DATETIME NOT NULL, used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      undergraduate TEXT, gpa REAL, target_major_id INTEGER REFERENCES majors(id),
      target_region TEXT, target_tier TEXT, self_assessment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      school_major_id INTEGER NOT NULL REFERENCES school_majors(id) ON DELETE CASCADE,
      score REAL NOT NULL, rank INTEGER, factors_json TEXT,
      status TEXT DEFAULT 'pending', notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS data_update_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL, status TEXT NOT NULL,
      records_added INTEGER DEFAULT 0, records_updated INTEGER DEFAULT 0,
      error_message TEXT, started_at DATETIME, finished_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      username TEXT, page TEXT NOT NULL,
      ip TEXT, user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing users table — add new columns if missing
  const userCols = db.prepare("PRAGMA table_info('users')").all().map(r => r.name);
  const newCols = [
    { name: 'phone', def: 'TEXT' },
    { name: 'province', def: 'TEXT' },
    { name: 'undergraduate_school', def: 'TEXT' },
    { name: 'grade', def: 'TEXT' },
    { name: 'major_name', def: 'TEXT' },
    { name: 'notes', def: 'TEXT' },
  ];
  for (const col of newCols) {
    if (!userCols.includes(col.name)) {
      try { db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`); } catch { /* ignore */ }
    }
  }
  // Unique index on phone (only create if column exists now)
  const updatedCols = db.prepare("PRAGMA table_info('users')").all().map(r => r.name);
  if (updatedCols.includes('phone')) {
    try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone)'); } catch { /* ignore */ }
  }

  // Indices for query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_score_lines_school ON score_lines(school_id);
    CREATE INDEX IF NOT EXISTS idx_score_lines_major ON score_lines(major_id);
    CREATE INDEX IF NOT EXISTS idx_score_lines_year ON score_lines(year);
    CREATE INDEX IF NOT EXISTS idx_score_lines_school_major ON score_lines(school_id, major_id);
    CREATE INDEX IF NOT EXISTS idx_score_lines_school_major_year ON score_lines(school_id, major_id, year);
    CREATE INDEX IF NOT EXISTS idx_admission_data_school ON admission_data(school_id);
    CREATE INDEX IF NOT EXISTS idx_admission_data_major ON admission_data(major_id);
    CREATE INDEX IF NOT EXISTS idx_admission_data_year ON admission_data(year);
    CREATE INDEX IF NOT EXISTS idx_admission_data_school_major ON admission_data(school_id, major_id);
    CREATE INDEX IF NOT EXISTS idx_admission_data_school_major_year ON admission_data(school_id, major_id, year);
    CREATE INDEX IF NOT EXISTS idx_school_majors_school ON school_majors(school_id);
    CREATE INDEX IF NOT EXISTS idx_school_majors_major ON school_majors(major_id);
    CREATE INDEX IF NOT EXISTS idx_comments_school ON comments(school_id);
    CREATE INDEX IF NOT EXISTS idx_schools_tier ON schools(tier);
    CREATE INDEX IF NOT EXISTS idx_schools_province ON schools(province);
    CREATE INDEX IF NOT EXISTS idx_majors_discipline ON majors(discipline);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
    CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);
    CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
    CREATE INDEX IF NOT EXISTS idx_sms_codes_phone ON sms_codes(phone);
  `);
}

export default db;
