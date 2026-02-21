import { Router } from 'express';
import Event from '../models/Event.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const city = (req.query.city || 'Sydney').trim();

    // 🔥 FIX 1: date filter optional rakho
    const q = {
      city,
      status: { $ne: 'inactive' },
    };

    if (req.query.from) {
      q.dateTime = { $gte: new Date(req.query.from) };
    }

    if (req.query.to) {
      q.dateTime = q.dateTime || {};
      q.dateTime.$lte = new Date(req.query.to);
    }

    const events = await Event.find(q)
      .sort({ dateTime: 1 })
      .limit(200)
      .lean();

    // 🔥 FIX 2: wrap response
    res.json({ events });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ error: 'Not found' });
    res.json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;