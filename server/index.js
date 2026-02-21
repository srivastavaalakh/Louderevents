import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

import { connectDB } from './db.js';
import configurePassport from './config/passport.js';

import { startScraperCron } from './jobs/scraperCron.js';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import emailSignupRoutes from './routes/emailSignup.js';
import dashboardRoutes from './routes/dashboard.js';
import { runScrape } from './services/scraper/index.js';

const app = express(); // ✅ ONLY ONCE
const PORT = process.env.PORT || 5000;

/* =======================
   CORS (VERY IMPORTANT)
======================= */
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://louderevents.vercel.app', // ✅ your Vercel frontend
    ],
    credentials: true,
  })
);

/* =======================
   Middlewares
======================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true on Render
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

/* =======================
   Passport
======================= */
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

/* =======================
   Routes
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/email-signup', emailSignupRoutes);
app.use('/api/dashboard', dashboardRoutes);

/* =======================
   Health Check
======================= */
app.get('/api/health', (_, res) => {
  res.json({ ok: true, status: 'Backend is running 🚀' });
});

/* =======================
   Manual Scrape API
======================= */
app.post('/api/scrape', async (_, res) => {
  try {
    await runScrape();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   DB + Server Start
======================= */
connectDB()
  .then(() => {
    startScraperCron();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  });