# Afaq — Local Sales Intelligence

Afaq is a bilingual English/Arabic sales reporting application. It runs locally
with Node.js and SQLite, or on Cloudflare Workers with a D1 database.

## Features

- Add, edit, load, and delete sales records
- Track stores, platforms, costs, purchases, and WhatsApp activity
- Calculate sales and performance metrics automatically
- Export daily, weekly, and monthly text reports
- Start new entries on yesterday's date in Saudi Arabia; weekly reports remember each saved week's no-reply sales count
- Extract a copyable daily ad-cost summary by store; international summaries include each country's individual sale values
- English and Arabic interface with right-to-left support
- Generate sample data for testing

## Requirements

- Node.js 20 or newer

No PostgreSQL installation is needed for local use.

## Run Locally

```powershell
npm install
npm start
```

Open `http://localhost:3000` in a browser.

The database is created automatically at `data/afaq.sqlite`.

## Optional Settings

```env
PORT=3000
DATA_DIR=data
```

## Local Data and Backups

All saved records are kept in `data/afaq.sqlite`. Stop the application and copy
that file somewhere safe to create a backup. To restore a backup, stop the
application and replace the database file.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/add` | Add a record |
| `GET` | `/data` | List records |
| `PUT` | `/update/:id` | Update a record |
| `DELETE` | `/delete/:id` | Delete a record |
| `POST` | `/seed` | Generate sample data |
| `GET`, `POST` | `/weekly-no-reply` | Read or save a weekly no-reply sales count by market and store |

## Cloudflare

The Worker configuration is in `cloudflare/wrangler.json`. Before deploying a
version with weekly no-reply counts to an existing D1 database, apply
`migrations/20261023_weekly_no_reply.sql` using Wrangler's remote D1 execute
command. Then deploy the Worker and static assets with Wrangler.

## Project Files

- `server.js` — Express server, SQLite setup, and API routes
- `public/index.html` — application interface
- `public/app.js` — frontend behavior, calculations, and report exports
- `public/style.css` — visual design and responsive layout
