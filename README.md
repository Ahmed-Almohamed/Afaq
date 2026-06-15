# Afaq Data Analyst App

Afaq is a lightweight sales reporting web app built with Node.js, Express, and PostgreSQL. It provides a bilingual (English/Arabic) data entry UI, sales record management, export reporting, and sample data generation.

## Features

- Add, edit, and delete sales records
- Bilingual English/Arabic user interface
- Automated purchase count and value calculations
- Export daily, weekly, and monthly reports to text files
- Load saved entries by store/platform
- Sample seed data generation for testing
- PostgreSQL backend with automatic table creation and indexing

## Technology Stack

- Node.js 20.x
- Express 5
- PostgreSQL
- Vanilla JavaScript frontend in `public/app.js`
- Static frontend served from `public/`

## Project Structure

- `server.js` — Express server and PostgreSQL API routes
- `public/index.html` — frontend HTML shell
- `public/style.css` — application styles
- `public/app.js` — frontend logic and export/report generation
- `.env.example` — sample environment variables
- `MIGRATION_GUIDE.md` — PostgreSQL migration notes

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a PostgreSQL database and configure environment variables.

3. Copy `.env.example` to `.env` and update values:

```bash
copy .env.example .env
```

4. Start the app:

```bash
node server.js
```

5. Open the app in your browser at:

```
http://localhost:3000
```

## Environment Variables

Use either `DATABASE_URL` or the individual PostgreSQL settings below:

- `DATABASE_URL`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `PORT`
- `NODE_ENV`

## GitHub Repository Setup

If you want to push this project to GitHub, run:

```bash
cd "c:\\Users\\VICTUS\\Downloads\\New folder (2)\\afaq-data- analyst-app"
git init
git add .
git commit -m "Initial commit"
```

Then create a new GitHub repository in your account and add it as a remote, for example:

```bash
git remote add origin https://github.com/your-username/afaq-data-analyst-app.git
git branch -M main
git push -u origin main
```

> If Git is not installed locally, install it from https://git-scm.com/downloads first.

## Render Deployment (Free)

Render can host this Node.js app with a free tier for web services.

1. Create a GitHub repository and push the project.
2. Sign in to https://render.com
3. Click `New +` and choose `Web Service`
4. Connect your GitHub account and select the repository
5. Use these settings:
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Branch: `main`
6. Add the database connection environment variable:
   - `DATABASE_URL` = your PostgreSQL connection string

If you need a PostgreSQL database, use Render Postgres or a free PostgreSQL service.

## Alternative Free Hosting

- Railway: free PostgreSQL + Node.js deployment
- Supabase: PostgreSQL database, then deploy Node.js elsewhere
- Fly.io: small free tier for Node.js

## API Endpoints

- `POST /add` — add a new sales record
- `GET /data` — list all records
- `PUT /update/:id` — update a record
- `DELETE /delete/:id` — remove a record
- `POST /seed` — generate sample data

## Notes

- The app auto-creates the `sales` table at startup
- Indexes are created on `date`, `store`, and `platform`
- The frontend uses static assets from the `public/` folder

---

If you want, I can also create a GitHub actions workflow or Render YAML for easier deployment after you push the repo.