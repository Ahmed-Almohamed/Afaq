const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For local development without DATABASE_URL:
  ...(process.env.DATABASE_URL
    ? {}
    : {
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "afaq_analytics",
      }),
  // Enable SSL for production (Railway requires it)
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Error handler for pool
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        store TEXT NOT NULL,
        platform TEXT NOT NULL,
        ads_count INTEGER NOT NULL DEFAULT 0,
        platform_sales INTEGER NOT NULL DEFAULT 0,
        whatsapp_sales INTEGER NOT NULL DEFAULT 0,
        unknown_sales INTEGER NOT NULL DEFAULT 0,
        ad_spend REAL NOT NULL DEFAULT 0,
        cost REAL NOT NULL DEFAULT 0,
        purchase_count INTEGER NOT NULL DEFAULT 0,
        purchase_value REAL NOT NULL DEFAULT 0,
        purchase_values_json TEXT NOT NULL DEFAULT '[]',
        whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
        content_cost REAL NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for common queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_platform ON sales(platform)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_date_store ON sales(date, store)
    `);

    console.log("✓ Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("✗ Database initialization error:", error.message);
    throw error;
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * POST /add - Add a new sales record
 */
app.post("/add", async (req, res) => {
  try {
    const {
      date,
      store,
      platform,
      ads_count,
      platform_sales,
      whatsapp_sales,
      unknown_sales,
      cost,
      purchase_count,
      purchase_value,
      purchase_values,
      whatsapp_clicks,
      content_cost,
    } = req.body;

    // Validation
    if (!date || !store) {
      return res.status(400).json({ error: "Date and store are required." });
    }

    // Process purchase values
    const purchaseCount = Number(purchase_count) || 0;
    let purchaseValuesArr = [];
    if (Array.isArray(purchase_values)) {
      purchaseValuesArr = purchase_values.map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      });
    }
    if (purchaseValuesArr.length < purchaseCount) {
      purchaseValuesArr = purchaseValuesArr.concat(
        Array(purchaseCount - purchaseValuesArr.length).fill(0)
      );
    } else if (purchaseValuesArr.length > purchaseCount) {
      purchaseValuesArr = purchaseValuesArr.slice(0, purchaseCount);
    }
    const purchaseValuesJson = JSON.stringify(purchaseValuesArr);
    const purchaseValueSum =
      purchaseValuesArr.reduce((a, b) => a + b, 0) ||
      Number(purchase_value) ||
      0;

    // Insert into database
    const query = `
      INSERT INTO sales (
        date, store, platform, ads_count, platform_sales, whatsapp_sales,
        unknown_sales, ad_spend, cost, content_cost, purchase_count, purchase_value,
        purchase_values_json, whatsapp_clicks, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
      RETURNING id
    `;

    const params = [
      String(date),
      String(store),
      String(platform ?? ""),
      Number(ads_count) || 0,
      Number(platform_sales) || 0,
      Number(whatsapp_sales) || 0,
      Number(unknown_sales) || 0,
      0,
      Number(cost) || 0,
      Number(content_cost) || 0,
      purchaseCount,
      purchaseValueSum,
      purchaseValuesJson,
      Number(whatsapp_clicks) || 0,
    ];

    const result = await pool.query(query, params);
    const id = result.rows[0].id;

    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error("Error adding record:", error);
    res.status(500).json({ error: "Failed to save record." });
  }
});

/**
 * GET /data - Retrieve all sales records
 */
app.get("/data", async (req, res) => {
  try {
    const query = `
      SELECT * FROM sales
      ORDER BY date DESC, id DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Failed to read data." });
  }
});

/**
 * PUT /update/:id - Update an existing sales record
 */
app.put("/update/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid record id." });
    }

    const {
      date,
      store,
      platform,
      ads_count,
      platform_sales,
      whatsapp_sales,
      unknown_sales,
      cost,
      content_cost,
      purchase_count,
      purchase_value,
      purchase_values,
      whatsapp_clicks,
    } = req.body;

    // Validation
    if (!date || !store) {
      return res.status(400).json({ error: "Date and store are required." });
    }

    // Process purchase values
    const purchaseCount = Number(purchase_count) || 0;
    let purchaseValuesArr = [];
    if (Array.isArray(purchase_values)) {
      purchaseValuesArr = purchase_values.map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      });
    }
    if (purchaseValuesArr.length < purchaseCount) {
      purchaseValuesArr = purchaseValuesArr.concat(
        Array(purchaseCount - purchaseValuesArr.length).fill(0)
      );
    } else if (purchaseValuesArr.length > purchaseCount) {
      purchaseValuesArr = purchaseValuesArr.slice(0, purchaseCount);
    }
    const purchaseValuesJson = JSON.stringify(purchaseValuesArr);
    const purchaseValueSum =
      purchaseValuesArr.reduce((a, b) => a + b, 0) ||
      Number(purchase_value) ||
      0;

    // Update record
    const query = `
      UPDATE sales SET
        date = $1, store = $2, platform = $3, ads_count = $4, platform_sales = $5,
        whatsapp_sales = $6, unknown_sales = $7, ad_spend = $8, cost = $9,
        content_cost = $10, purchase_count = $11, purchase_value = $12,
        purchase_values_json = $13, whatsapp_clicks = $14
      WHERE id = $15
      RETURNING id
    `;

    const params = [
      String(date),
      String(store),
      String(platform ?? ""),
      Number(ads_count) || 0,
      Number(platform_sales) || 0,
      Number(whatsapp_sales) || 0,
      Number(unknown_sales) || 0,
      0,
      Number(cost) || 0,
      Number(content_cost) || 0,
      purchaseCount,
      purchaseValueSum,
      purchaseValuesJson,
      Number(whatsapp_clicks) || 0,
      id,
    ];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found." });
    }

    res.json({ ok: true, id });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ error: "Failed to update record." });
  }
});

/**
 * DELETE /delete/:id - Delete a sales record
 */
app.delete("/delete/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid record id." });
    }

    const query = "DELETE FROM sales WHERE id = $1 RETURNING id";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found." });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ error: "Failed to delete record." });
  }
});

/**
 * POST /seed - Generate sample data (30 days)
 */
app.post("/seed", async (req, res) => {
  try {
    console.log("Generating sample data...");

    const platformMapByStore = {
      "micro store": [
        "TikTok-viofo",
        "snapchat-viofo",
        "TikTok-projector",
        "snapchat-projector",
        "Google",
        "Google Shopping",
        "TikTok",
        "Snapchat",
        "Meta",
        "karzoun",
      ],
      "birq store": [
        "google iraq",
        "Google",
        "Google Shopping",
        "TikTok",
        "Snapchat",
        "Meta",
        "karzoun",
        "meta iraq",
      ],
      "zmord store": ["TikTok", "Google", "Google Shopping", "Snapchat", "Meta", "karzoun"],
      "alshahens store": ["TikTok", "Google", "Google Shopping", "Snapchat", "Meta", "karzoun"],
    };

    const stores = ["micro store", "birq store", "alshahens store", "zmord store"];

    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomMoney(min, max) {
      return Number((Math.random() * (max - min) + min).toFixed(2));
    }

    let recordsCreated = 0;

    // Generate 30 days of data
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split("T")[0];

      for (const store of stores) {
        for (const platform of platformMapByStore[store]) {
          const isKarzoun = platform === "karzoun";
          const isGoogle = platform.toLowerCase().includes("google");
          const isSnap = platform.toLowerCase().includes("snap");
          const cost = isKarzoun ? randomMoney(18, 55) : randomMoney(25, isGoogle ? 180 : 260);
          const adsCount = isKarzoun ? 0 : randomInt(0, 4);
          const platformSales = isKarzoun ? randomInt(0, 2) : randomInt(0, isSnap ? 5 : 4);
          const whatsappSales = isKarzoun ? randomInt(0, 1) : randomInt(0, isGoogle ? 2 : 3);
          const unknownSales = randomInt(0, 3);
          const purchaseCount = platformSales + whatsappSales;
          const purchaseValues = Array.from(
            { length: purchaseCount },
            () => randomMoney(120, 1450)
          );
          const contentCost = dayOffset % 10 === 0 && platform === "Meta" ? randomMoney(80, 350) : 0;

          const query = `
            INSERT INTO sales (
              date, store, platform, ads_count, platform_sales, whatsapp_sales,
              unknown_sales, ad_spend, cost, content_cost, purchase_count, purchase_value,
              purchase_values_json, whatsapp_clicks, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
          `;

          const params = [
            dateStr,
            store,
            platform,
            adsCount,
            platformSales,
            whatsappSales,
            unknownSales,
            0,
            cost,
            contentCost,
            purchaseCount,
            purchaseValues.reduce((a, b) => a + b, 0),
            JSON.stringify(purchaseValues),
            randomInt(0, isGoogle ? 45 : 18),
          ];

          await pool.query(query, params);
          recordsCreated++;
        }
      }
    }

    console.log(`✓ Created ${recordsCreated} sample records`);
    res.json({ ok: true, recordsCreated });
  } catch (error) {
    console.error("Error seeding data:", error);
    res.status(500).json({ error: "Failed to seed data." });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("✓ Connected to PostgreSQL database");

    // Initialize database schema
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Sales Reporting System running at http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`  Database: ${process.env.DATABASE_URL ? "PostgreSQL (Railway)" : "PostgreSQL (Local)"}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
