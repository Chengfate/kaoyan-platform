import express from 'express';
import cors from 'cors';
import db, { initTables } from './database.js';
import { runSeed } from './seed.js';
import { enrichData } from './enrich-data.js';
import schoolsRouter from './routes/schools.js';
import majorsRouter from './routes/majors.js';
import scoreLinesRouter from './routes/score-lines.js';
import admissionsRouter from './routes/admissions.js';
import recommendationsRouter from './routes/recommendations.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import commentsRouter from './routes/comments.js';
import visitsRouter from './routes/visits.js';
import { startScheduler } from './scraper/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = path.resolve(__dirname, '../../frontend/dist');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize DB tables & seed & enrich
initTables();
runSeed();
enrichData();

// Routes
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, pagination: null, error: null });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/schools', schoolsRouter);
app.use('/api/v1/majors', majorsRouter);
app.use('/api/v1/score-lines', scoreLinesRouter);
app.use('/api/v1/admissions', admissionsRouter);
app.use('/api/v1/recommendations', recommendationsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/visits', visitsRouter);
app.use('/api/v1', commentsRouter);

// Serve built frontend static files + SPA fallback
app.use(express.static(STATIC_DIR, { maxAge: '1h' }));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ success: false, error: 'Not found' });
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`考研择校分析平台后端已启动: http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/v1/health`);
  startScheduler();
});
