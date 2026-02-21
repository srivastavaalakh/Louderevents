import { Router } from 'express';
import EmailSignup from '../models/EmailSignup.js';
import Event from '../models/Event.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email, consent, eventId } = req.body;
    if (!email || typeof consent !== 'boolean' || !eventId) {
      return res.status(400).json({ error: 'Email, consent and eventId are required' });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await EmailSignup.create({ email, consent, event: eventId });
    res.json({ ok: true, redirectUrl: event.originalUrl });
  } catch (e) {
    if (e.code === 11000) return res.json({ ok: true, redirectUrl: (await Event.findById(req.body.eventId))?.originalUrl });
    res.status(500).json({ error: e.message });
  }
});

export default router;
