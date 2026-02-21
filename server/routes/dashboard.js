import { Router } from 'express';
import Event from '../models/Event.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.use(requireAuth);

router.get('/events', async (req, res) => {
  try {
    const city = (req.query.city || 'Sydney').trim();
    const keyword = (req.query.keyword || '').trim();
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const q = { city };
    if (keyword) {
      q.$or = [
        { title: new RegExp(keyword, 'i') },
        { venueName: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') },
      ];
    }
    if (from || to) {
      q.dateTime = {};
      if (from) q.dateTime.$gte = from;
      if (to) q.dateTime.$lte = to;
    }

    const events = await Event.find(q).sort({ dateTime: 1 }).limit(500).lean();
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/events/:id/import', async (req, res) => {
  try {
    const { importNotes } = req.body || {};
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: 'imported',
        importedAt: new Date(),
        importedBy: req.user._id,
        importNotes: importNotes || '',
      },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
