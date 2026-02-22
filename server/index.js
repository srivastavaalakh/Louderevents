import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://louderevents.vercel.app',
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
configurePassport();

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/email-signup', emailSignupRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/scrape', async (req, res) => {
  try {
    await runScrape();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectDB().then(() => {
  startScraperCron();
  app.listen(PORT, () =>
    console.log(`Server running on ${PORT}`)
  );
});
