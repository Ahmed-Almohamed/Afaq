# PostgreSQL Migration Guide

## ✅ Migration Complete!

Your Node.js backend has been successfully migrated from SQLite to PostgreSQL with the following improvements:

## Key Changes

### 1. **Database Driver**
- ✅ Replaced `sqlite3` with `pg` (PostgreSQL client)
- ✅ Uses connection pooling for better performance
- ✅ Supports `DATABASE_URL` environment variable (Railway standard)

### 2. **Code Modernization**
- ✅ Converted all callbacks to async/await
- ✅ Parameterized queries ($1, $2, etc.) for SQL injection protection
- ✅ Proper error handling on all routes
- ✅ Graceful shutdown on SIGINT

### 3. **Database Schema**
- ✅ All tables created automatically on startup
- ✅ Indexes added for common queries (date, store, platform)
- ✅ SERIAL PRIMARY KEY (auto-incrementing) instead of INTEGER PRIMARY KEY
- ✅ TIMESTAMP type for better date handling

### 4. **Connection Management**
- ✅ SSL support for Railway (rejectUnauthorized: false)
- ✅ Connection pooling prevents connection exhaustion
- ✅ Automatic reconnection on connection loss
- ✅ Graceful shutdown with pool.end()

## Local Development Setup

### 1. Install PostgreSQL
On Windows:
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use: choco install postgresql
```

### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE afaq_analytics;

# Exit
\q
```

### 3. Create .env file
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your PostgreSQL credentials:
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=afaq_analytics
NODE_ENV=development
```

### 4. Install npm packages
```bash
npm install
```

### 5. Start Server
```bash
node server.js
```

Expected output:
```
✓ Connected to PostgreSQL database
✓ Database tables initialized successfully
✓ Sales Reporting System running at http://localhost:3000
  Environment: development
  Database: PostgreSQL (Local)
```

## Railway Deployment

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

### 2. Create New Project
- Click "New Project"
- Select "Provision PostgreSQL"
- Railway will create a PostgreSQL instance and provide `DATABASE_URL`

### 3. Deploy Your App
**Option A: Connect GitHub Repository**
- Click "Add Service" → "GitHub Repo"
- Select your repository
- Railway auto-detects Node.js and starts the app

**Option B: Use Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 4. Environment Variables
Railway automatically sets:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Will be dynamically assigned (e.g., 8080)

The app respects both variables automatically.

### 5. Verify Deployment
- Check Railway dashboard for logs
- Visit your app URL
- All database operations should work without changes

## API Compatibility

### ✅ All Routes Work the Same Way

**POST /add** - Add sales record
```bash
curl -X POST http://localhost:3000/add \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-04-28",
    "store": "birq store",
    "platform": "google",
    "ads_count": 100,
    "cost": 500,
    "purchase_count": 20,
    "whatsapp_clicks": 15
  }'
```

**GET /data** - Get all records
```bash
curl http://localhost:3000/data
```

**PUT /update/:id** - Update record
```bash
curl -X PUT http://localhost:3000/update/1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-28", "store": "birq store", ...}'
```

**DELETE /delete/:id** - Delete record
```bash
curl -X DELETE http://localhost:3000/delete/1
```

**POST /seed** - Generate sample data
```bash
curl -X POST http://localhost:3000/seed
```

## Database Features

### Automatic Indexes
The app creates indexes on:
- `date` - for date range queries
- `store` - for store filtering
- `platform` - for platform filtering
- `(date, store)` - for combined queries

### Automatic Table Creation
No manual database setup needed! The app:
1. Checks connection on startup
2. Creates `sales` table if it doesn't exist
3. Creates indexes automatically
4. Ready to use immediately

### Data Type Mapping

| SQLite | PostgreSQL |
|--------|-----------|
| INTEGER PRIMARY KEY AUTOINCREMENT | SERIAL PRIMARY KEY |
| TEXT | TEXT |
| REAL | REAL (or NUMERIC) |
| INTEGER | INTEGER |
| datetime('now') | CURRENT_TIMESTAMP |

## Troubleshooting

### "Cannot find module 'pg'"
```bash
npm install pg
```

### Connection refused (local development)
```bash
# Check PostgreSQL is running:
psql -U postgres -c "SELECT 1"

# If error, start PostgreSQL service:
# Windows: net start postgresql-x64-15
# Mac: brew services start postgresql
# Linux: sudo service postgresql start
```

### "database "afaq_analytics" does not exist"
```bash
# Create database:
psql -U postgres -c "CREATE DATABASE afaq_analytics;"
```

### "FATAL: remaining connection slots reserved for non-replication superuser connections"
PostgreSQL connection limit reached. Increase in postgresql.conf or reduce pool size in server.js.

### Railway deployment shows "H10 App crashed"
Check the logs:
```bash
railway logs
```

Usually caused by:
1. DATABASE_URL not set → Railway should set this automatically
2. Port binding error → App respects process.env.PORT
3. Node modules not installed → Railway runs `npm install` automatically

## Performance Optimization

The migrated app includes:
- ✅ Connection pooling (reduces overhead)
- ✅ Parameterized queries (prevents SQL injection)
- ✅ Indexes on common query columns
- ✅ Async/await (non-blocking operations)
- ✅ Error handling (prevents crashes)

## Rollback (if needed)

To restore SQLite version:
```bash
git checkout HEAD -- server.js package.json
npm install
```

## Next Steps

1. ✅ Test locally with PostgreSQL
2. ✅ Deploy to Railway
3. ✅ Verify all routes work
4. ✅ Seed sample data with `/seed` endpoint
5. ✅ Export weekly/daily reports (no changes needed in frontend)

## Questions?

- Railway Docs: https://docs.railway.app
- PostgreSQL Docs: https://www.postgresql.org/docs
- Node pg docs: https://node-postgres.com

Happy deploying! 🚀
