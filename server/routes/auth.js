import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/dashboard`);
  }
);

router.get('/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ user: null });
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

export default router;
