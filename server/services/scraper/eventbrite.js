import axios from 'axios';
import * as cheerio from 'cheerio';

const SYDNEY_URL = 'https://www.eventbrite.com.au/d/australia--sydney/upcoming/';

export async function scrapeEventbrite() {
  const events = [];
  try {
    const { data } = await axios.get(SYDNEY_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });
    const $ = cheerio.load(data);

    // Eventbrite often uses data attributes or specific classes
    $('[data-testid="event-card"], .event-card, .discover-event-card, article[class*="event"]').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a[href*="eventbrite"]').attr('href') || $el.find('a').first().attr('href');
      const href = link ? (link.startsWith('http') ? link : `https://www.eventbrite.com.au${link}`) : '';
      const title =
        $el.find('h2, h3, [class*="title"]').first().text().trim() ||
        $el.find('a').first().text().trim();
      const dateText = $el.find('time, [class*="date"]').first().text().trim();
      const venue = $el.find('[class*="venue"], [class*="location"]').first().text().trim();
      const desc = $el.find('p, [class*="description"]').first().text().trim().slice(0, 300);
      const img = $el.find('img').first().attr('src') || '';

      if (!title && !href) return;
      const date = parseDate(dateText);
      events.push({
        sourceId: href ? new URL(href).pathname.replace(/\/$/, '') : null,
        title: title || 'Event',
        dateTime: date,
        venueName: venue,
        venueAddress: '',
        city: 'Sydney',
        description: desc,
        category: [],
        imageUrl: img.startsWith('http') ? img : '',
        originalUrl: href,
      });
    });

    // Fallback: any eventbrite event link
    if (events.length === 0) {
      $(`a[href*="eventbrite.com.au/e/"]`).each((_, el) => {
        const $a = $(el);
        const href = ($a.attr('href') || '').trim();
        if (!href) return;
        const full = href.startsWith('http') ? href : `https://www.eventbrite.com.au${href}`;
        const title = $a.text().trim() || $a.closest('div').find('h2, h3').first().text().trim() || 'Event';
        events.push({
          sourceId: new URL(full).pathname.replace(/\/$/, ''),
          title: title.slice(0, 200) || 'Event',
          dateTime: new Date(Date.now() + 86400000),
          venueName: '',
          venueAddress: '',
          city: 'Sydney',
          description: '',
          category: [],
          imageUrl: '',
          originalUrl: full,
        });
      });
    }
  } catch (e) {
    console.warn('Eventbrite scrape failed:', e.message);
  }
  return events.slice(0, 50);
}

function parseDate(text) {
  if (!text) return new Date(Date.now() + 86400000);
  const d = new Date(text);
  return isNaN(d.getTime()) ? new Date(Date.now() + 86400000) : d;
}
