// server/index.js
import 'dotenv/config'; // MUST be first

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

const app = express();
const PORT = process.env.PORT || 5000;

// 🔍 DEBUG (remove later)
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport config AFTER env + middleware
configurePassport();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/email-signup', emailSignupRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/scrape', async (_, res) => {
  try {
    await runScrape();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
connectDB()
  .then(() => {
    startScraperCron();
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });