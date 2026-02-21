// server/scripts/runScraper.js
import 'dotenv/config';

import { connectDB } from '../db.js';
import Event from '../models/Event.js';
import { runScrape } from '../services/scraper/index.js';
import { seedSydneyEvents } from '../services/scraper/seedSydney.js';

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('📊 Checking existing events...');
    const count = await Event.countDocuments();

    if (count === 0) {
      console.log('🌱 No events found. Seeding Sydney events...');
      await seedSydneyEvents();
    } else {
      console.log(`✅ ${count} events already exist. Skipping seed.`);
    }

    console.log('🕷️ Running scrapers...');
    await runScrape();

    console.log('✅ Scrape run complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Scraper failed:', err);
    process.exit(1);
  }
}

main();