import cron from 'node-cron';
import { runScrape } from '../services/scraper/index.js';

export function startScraperCron() {
  // Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled scrape...');
    try {
      await runScrape();
      console.log('Scheduled scrape done.');
    } catch (err) {
      console.error('Scheduled scrape failed:', err);
    }
  });
  console.log('Scraper cron scheduled (every 6 hours).');
}
