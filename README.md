# Louder — Sydney Events

A MERN-stack site that lists events in Sydney (and other cities), with scraping, auto-updates, email signup for tickets, and an admin dashboard with Google OAuth.

## Features

- **Event scraping** from multiple public event sites (Eventfinda, Eventbrite) for Sydney
- **Auto-updates** via cron (every 6 hours): new events → `new`, changed → `updated`, no longer on source → `inactive`
- **Public event listing** with minimal UI; each card has “GET TICKETS” (email + consent → save → redirect to source)
- **Google OAuth** and **dashboard**: city filter, keyword search, date range, table view, side preview, “Import to platform” (sets `imported` with `importedAt`, `importedBy`, `importNotes`), status tags: `new` / `updated` / `inactive` / `imported`

## Stack

- **Backend:** Node, Express, MongoDB (Mongoose), Passport (Google OAuth), node-cron, axios, cheerio
- **Frontend:** React (Vite), React Router

## Prerequisites

- Node 18+
- MongoDB running locally (e.g. `mongod`) or a `MONGODB_URI`
- Google OAuth credentials (Google Cloud Console → APIs & Services → Credentials)

## Setup

1. **Clone and install**
   ```bash
   cd louder
   npm install
   cd client && npm install && cd ..
   ```

2. **Environment**
   - Copy `.env.example` to `.env` in the project root.
   - Set:
     - `MONGODB_URI` (default: `mongodb://127.0.0.1:27017/louder`)
     - `CLIENT_URL=http://localhost:5173`
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`
     - `SESSION_SECRET` (random string)
   - In `client`, copy `client/.env.example` to `client/.env` and set:
     - `VITE_API_URL=http://localhost:5000` (so the “Sign in with Google” button hits the backend).

3. **Google OAuth**
   - Create an OAuth 2.0 Client ID (Web application).
   - Authorized redirect URI: `http://localhost:5000/api/auth/google/callback` (or your production callback URL).

4. **Run**
   ```bash
   npm run dev
   ```
   - Backend: http://localhost:5000  
   - Frontend: http://localhost:5173  

5. **Seed + scrape (optional)**  
   With MongoDB and backend running:
   ```bash
   node server/scripts/runScraper.js
   ```
   Or call `POST /api/scrape` to trigger a run. If no events exist, seed data (Sydney) is inserted so the site has something to show.

## Scripts

- `npm run dev` — run backend and frontend together
- `npm run dev:server` — backend only
- `npm run dev:client` — frontend only (from repo root: `cd client && npm run dev`)
- `npm run scrape` — run scraper once (and seed if DB empty)
- `npm run build` — build client for production

## API (summary)

- `GET /api/events?city=Sydney` — list events (excludes inactive)
- `GET /api/events/:id` — one event
- `POST /api/email-signup` — body: `{ email, consent, eventId }`; returns `redirectUrl`
- `GET /api/auth/google`, `GET /api/auth/google/callback` — Google OAuth
- `GET /api/auth/me` — current user (or 401)
- `POST /api/auth/logout` — logout
- `GET /api/dashboard/events?city=&keyword=&from=&to=` — dashboard list (auth required)
- `PATCH /api/dashboard/events/:id/import` — set imported (auth required)
- `POST /api/scrape` — trigger scrape run

## Status tags

- **new** — first time seen in a scrape
- **updated** — details changed since last run
- **inactive** — no longer returned by source or past cutoff
- **imported** — “Import to platform” used; stores `importedAt`, `importedBy`, `importNotes`

## License

MIT
