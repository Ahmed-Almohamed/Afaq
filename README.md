# Afaq — Local Sales Intelligence

Afaq is a bilingual English/Arabic sales reporting application for local retail
operations. It runs on Node.js and stores its records in a local SQLite file.

## Features

- Add, edit, load, and delete sales records
- Track stores, platforms, costs, purchases, and WhatsApp activity
- Calculate sales and performance metrics automatically
- Export daily, weekly, and monthly text reports
- English and Arabic interface with right-to-left support
- Generate sample data for testing

## Requirements

- Node.js 20 or newer

No PostgreSQL installation, cloud database, or online hosting account is needed.

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

## Project Files

- `server.js` — Express server, SQLite setup, and API routes
- `public/index.html` — application interface
- `public/app.js` — frontend behavior, calculations, and report exports
- `public/style.css` — visual design and responsive layout
