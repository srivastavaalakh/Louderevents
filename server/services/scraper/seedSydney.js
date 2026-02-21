import Event from '../../models/Event.js';

const SEED = [
  {
    title: 'Sydney Opera House Tour',
    dateTime: new Date(Date.now() + 2 * 86400000),
    venueName: 'Sydney Opera House',
    venueAddress: 'Bennelong Point, Sydney NSW 2000',
    city: 'Sydney',
    description: 'Guided tour of the iconic Opera House. Discover stories and architecture.',
    category: ['Arts', 'Culture'],
    imageUrl: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=400',
    sourceWebsite: 'Seed',
    originalUrl: 'https://www.sydneyoperahouse.com',
    sourceId: 'seed-opera-house',
    status: 'new',
  },
  {
    title: 'Bondi Beach Yoga',
    dateTime: new Date(Date.now() + 5 * 86400000),
    venueName: 'Bondi Beach',
    venueAddress: 'Bondi Beach, NSW 2026',
    city: 'Sydney',
    description: 'Free community yoga on the beach. All levels welcome.',
    category: ['Health', 'Outdoor'],
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    sourceWebsite: 'Seed',
    originalUrl: 'https://www.example.com/bondi-yoga',
    sourceId: 'seed-bondi-yoga',
    status: 'new',
  },
  {
    title: 'Rocks Market Weekend',
    dateTime: new Date(Date.now() + 7 * 86400000),
    venueName: 'The Rocks',
    venueAddress: 'George St, The Rocks NSW 2000',
    city: 'Sydney',
    description: 'Artisan market with local crafts, food and live music.',
    category: ['Markets', 'Food'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    sourceWebsite: 'Seed',
    originalUrl: 'https://www.therocks.com',
    sourceId: 'seed-rocks-market',
    status: 'new',
  },
];

export async function seedSydneyEvents() {
  for (const e of SEED) {
    await Event.findOneAndUpdate(
      { sourceWebsite: 'Seed', sourceId: e.sourceId },
      { $set: { ...e, lastScrapedAt: new Date() } },
      { upsert: true, new: true }
    );
  }
  return SEED.length;
}
