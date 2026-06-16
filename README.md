# Afaq — Sales Intelligence Platform

> Bilingual sales reporting and analytics for modern retail operations.  
> Built with Node.js · Express · PostgreSQL

---

## What Is Afaq?

**Afaq** (أفق — Arabic for "horizons") is a lightweight, production-ready web application that turns raw sales data into clear, actionable reports. Designed for teams that operate across English and Arabic markets, it gives you a single place to record, manage, and export your sales activity — with zero friction.

Whether you're tracking a single store or multiple platforms, Afaq handles the math, organises your records, and exports clean reports in seconds.

---

## Features

### 📊 Sales Record Management
- Add, edit, and delete sales records with a clean, minimal UI
- Automated purchase count and revenue calculations — no manual totalling
- Load saved entries filtered by store or platform

### 🌐 Bilingual Interface
- Full English / Arabic (عربي) support built into the UI
- Right-to-left layout handled natively

### 📁 Report Export
- Export **daily**, **weekly**, and **monthly** reports to text files
- One-click download, no configuration needed

### 🌱 Sample Data Generation
- Seed the database with realistic test data for demos or development
- Useful for onboarding new team members or QA testing

### 🗄️ Robust PostgreSQL Backend
- Auto-creates the `sales` table on first run — no manual migration
- Indexes on `date`, `store`, and `platform` for fast queries

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20.x |
| Framework | Express 5 |
| Database | PostgreSQL |
| Frontend | Vanilla JavaScript (no build step) |
| Styles | Custom CSS |

No heavy frameworks. No complex build pipeline. Just clean, readable code that's easy to deploy and maintain.

---

## Project Structure

```
afaq-data-analyst-app/
├── server.js            # Express server + all PostgreSQL API routes
├── public/
│   ├── index.html       # Frontend HTML shell
│   ├── style.css        # Application styles
│   └── app.js           # Frontend logic, export & report generation
├── .env.example         # Sample environment variable config
├── MIGRATION_GUIDE.md   # PostgreSQL migration notes
└── package.json
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/add` | Add a new sales record |
| `GET` | `/data` | List all records |
| `PUT` | `/update/:id` | Update an existing record |
| `DELETE` | `/delete/:id` | Remove a record |
| `POST` | `/seed` | Generate sample seed data |

---

## Local Setup

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- A running PostgreSQL instance

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/your-username/afaq-data-analyst-app.git
cd afaq-data-analyst-app
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
```
Then open `.env` and fill in your database credentials (see below).

**4. Start the app**
```bash
node server.js
```

**5. Open in your browser**
```
http://localhost:3000
```

The app will auto-create the `sales` table on first run. No manual migration needed.

---

## Environment Variables

Use either a full connection string or individual settings:

```env
# Option A — connection string
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Option B — individual settings
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=afaq

# App settings
PORT=3000
NODE_ENV=production
```

---

## Deployment

### Deploy to Render (Free Tier)

1. Push this repo to GitHub
2. Sign in at [render.com](https://render.com)
3. Click **New +** → **Web Service**
4. Connect your GitHub account and select this repository
5. Use these settings:

   | Setting | Value |
   |---|---|
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Branch | `main` |

6. Add your `DATABASE_URL` environment variable in the Render dashboard

Need a database? Use **Render Postgres** (free tier available) or any hosted PostgreSQL service.

### Other Free Hosting Options

| Platform | What It Offers |
|---|---|
| [Railway](https://railway.app) | Free PostgreSQL + Node.js, one-click deploy |
| [Supabase](https://supabase.com) | Free managed PostgreSQL |
| [Fly.io](https://fly.io) | Small free tier for Node.js apps |

---

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

<p align="center">Built with ❤️ — أُفق · Afaq</p>
