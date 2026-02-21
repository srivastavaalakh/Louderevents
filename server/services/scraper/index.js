import Event from '../../models/Event.js';
import { scrapeEventfinda } from './eventfinda.js';
import { scrapeEventbrite } from './eventbrite.js';
import { seedSydneyEvents } from './seedSydney.js';

const SOURCES = [
  { name: 'Eventfinda', fn: scrapeEventfinda },
  { name: 'Eventbrite', fn: scrapeEventbrite },
];

function normalizeEvent(raw, sourceWebsite, sourceId) {
  return {
    title: raw.title || 'Untitled Event',
    dateTime: raw.dateTime ? new Date(raw.dateTime) : new Date(),
    venueName: raw.venueName || '',
    venueAddress: raw.venueAddress || '',
    city: raw.city || 'Sydney',
    description: raw.description || '',
    category: Array.isArray(raw.category) ? raw.category : [],
    imageUrl: raw.imageUrl || '',
    sourceWebsite,
    sourceUrl: raw.originalUrl || '', // ✅ consistent naming
    sourceId: sourceId || raw.originalUrl || raw.title,
  };
}

export async function runScrape() {
  const now = new Date();

  const seen = new Map(); // key -> existing event
  const seenKeysThisRun = new Set();

  const existing = await Event.find({});
  existing.forEach((e) => {
    if (e.sourceId) {
      seen.set(`${e.sourceWebsite}:${e.sourceId}`, e);
    }
  });

  for (const source of SOURCES) {
    try {
      const rawList = await source.fn();

      for (const raw of rawList) {
        const sourceId = raw.sourceId || raw.originalUrl || raw.title;
        const key = `${source.name}:${sourceId}`;

        seenKeysThisRun.add(key);

        const payload = normalizeEvent(raw, source.name, sourceId);
        payload.lastScrapedAt = now;

        const existingDoc = seen.get(key);

        if (!existingDoc) {
          // 🆕 New event
          const created = await Event.create({
            ...payload,
            status: 'new',
          });
          seen.set(key, created);
        } else {
          // 🔄 Change detection
          const changed =
            existingDoc.title !== payload.title ||
            String(existingDoc.dateTime) !== String(payload.dateTime) ||
            existingDoc.venueName !== payload.venueName ||
            existingDoc.venueAddress !== payload.venueAddress ||
            existingDoc.description !== payload.description ||
            existingDoc.imageUrl !== payload.imageUrl ||
            existingDoc.sourceUrl !== payload.sourceUrl;

          if (changed && existingDoc.status !== 'imported') {
            await Event.updateOne(
              { _id: existingDoc._id },
              {
                $set: {
                  ...payload,
                  status: 'updated',
                },
              }
            );
          } else {
            // ✅ no change, but still update scrape time
            await Event.updateOne(
              { _id: existingDoc._id },
              { $set: { lastScrapedAt: now } }
            );
          }
        }
      }
    } catch (err) {
      console.error(`Scraper ${source.name} failed:`, err.message);
    }
  }

  // ❌ Mark inactive: not seen in this run (never touch imported)
  const idsNotSeen = existing
    .filter(
      (e) =>
        e.sourceId &&
        !seenKeysThisRun.has(`${e.sourceWebsite}:${e.sourceId}`) &&
        e.status !== 'imported'
    )
    .map((e) => e._id);

  if (idsNotSeen.length) {
    await Event.updateMany(
      { _id: { $in: idsNotSeen } },
      { $set: { status: 'inactive' } }
    );
  }

  // ❌ Past events
  await Event.updateMany(
    {
      status: { $ne: 'imported' },
      dateTime: { $lt: new Date() },
    },
    { $set: { status: 'inactive' } }
  );

  // 🌱 Seed fallback (demo safety)
  const count = await Event.countDocuments({
    status: { $ne: 'inactive' },
    city: 'Sydney',
  });

  if (count === 0) {
    await seedSydneyEvents();
  }

  return { ok: true };
}