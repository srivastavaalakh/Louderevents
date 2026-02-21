import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE = 'https://www.eventfinda.com.au';
const SYDNEY_LIST = `${BASE}/whatson/sydney`;

export async function scrapeEventfinda() {
  const events = [];
  const { data } = await axios.get(SYDNEY_LIST, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 15000,
  });
  const $ = cheerio.load(data);

  $('.event-list-item, .event_item, .event-item, [class*="event"]').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a[href*="/event/"]').attr('href') || $el.find('a').first().attr('href');
    const href = link ? (link.startsWith('http') ? link : new URL(link, BASE).href) : '';
    const title =
      $el.find('h2, h3, .title, [class*="title"]').first().text().trim() ||
      $el.find('a').first().text().trim();
    const dateText = $el.find('.date, [class*="date"], time').first().text().trim();
    const venue = $el.find('.venue, [class*="venue"], .location').first().text().trim();
    const desc = $el.find('.description, [class*="description"], p').first().text().trim().slice(0, 300);
    const img = $el.find('img').first().attr('src') || '';

    if (!title && !href) return;
    const date = parseDate(dateText);
    events.push({
      sourceId: href ? href.replace(/\/$/, '').split('/').pop() : null,
      title: title || 'Event',
      dateTime: date,
      venueName: venue,
      venueAddress: '',
      city: 'Sydney',
      description: desc,
      category: [],
      imageUrl: img.startsWith('http') ? img : img ? new URL(img, BASE).href : '',
      originalUrl: href,
    });
  });

  // Fallback: try any link that looks like an event
  if (events.length === 0) {
    $(`a[href*="/event/"]`).each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      const full = href.startsWith('http') ? href : new URL(href, BASE).href;
      const title = $a.text().trim() || $a.closest('li').find('h2, h3').first().text().trim() || 'Event';
      if (title && full) {
        events.push({
          sourceId: full.replace(/\/$/, '').split('/').pop(),
          title,
          dateTime: new Date(Date.now() + 86400000),
          venueName: '',
          venueAddress: '',
          city: 'Sydney',
          description: '',
          category: [],
          imageUrl: '',
          originalUrl: full,
        });
      }
    });
  }

  return events.slice(0, 50);
}

function parseDate(text) {
  if (!text) return new Date(Date.now() + 86400000);
  const d = new Date(text);
  return isNaN(d.getTime()) ? new Date(Date.now() + 86400000) : d;
}
