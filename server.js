const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const PORT = process.env.PORT || 3000;

const dataDirectory = path.resolve(__dirname, process.env.DATA_DIR || "data");
fs.mkdirSync(dataDirectory, { recursive: true });
const databasePath = path.join(dataDirectory, "afaq.sqlite");
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.get(["/saudi", "/international"], (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

function initializeDatabase() {
  try {
    console.log("Initializing database...");

    db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        market TEXT NOT NULL DEFAULT 'saudi',
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
      CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store);
      CREATE INDEX IF NOT EXISTS idx_sales_platform ON sales(platform);
      CREATE INDEX IF NOT EXISTS idx_sales_date_store ON sales(date, store);
    `);

    const columns = db.prepare("PRAGMA table_info(sales)").all();
    if (!columns.some((column) => column.name === "market")) {
      db.exec("ALTER TABLE sales ADD COLUMN market TEXT NOT NULL DEFAULT 'saudi'");
    }
    db.exec("CREATE INDEX IF NOT EXISTS idx_sales_market_date ON sales(market, date)");

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
      market,
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
        market, date, store, platform, ads_count, platform_sales, whatsapp_sales,
        unknown_sales, ad_spend, cost, content_cost, purchase_count, purchase_value,
        purchase_values_json, whatsapp_clicks, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const params = [
      market === "international" ? "international" : "saudi",
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

    const result = db.prepare(query).run(...params);
    const id = Number(result.lastInsertRowid);

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
    const market = req.query.market === "international" ? "international" : "saudi";
    const query = `
      SELECT * FROM sales
      WHERE market = ?
      ORDER BY date DESC, id DESC
    `;

    const rows = db.prepare(query).all(market);
    res.json(rows);
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
        date = ?, store = ?, platform = ?, ads_count = ?, platform_sales = ?,
        whatsapp_sales = ?, unknown_sales = ?, ad_spend = ?, cost = ?,
        content_cost = ?, purchase_count = ?, purchase_value = ?,
        purchase_values_json = ?, whatsapp_clicks = ?
      WHERE id = ?
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

    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Record not found." });
    }

    res.json({ ok: true, id });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ error: "Failed to update record." });
  }
});

/**
 * DELETE /delete-all - Delete all saved sales history
 */
app.delete("/delete-all", (req, res) => {
  try {
    const market = req.query.market === "international" ? "international" : "saudi";
    const result = db.prepare("DELETE FROM sales WHERE market = ?").run(market);
    res.json({ ok: true, deletedCount: result.changes });
  } catch (error) {
    console.error("Error deleting all records:", error);
    res.status(500).json({ error: "Failed to delete all records." });
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

    const query = "DELETE FROM sales WHERE id = ?";
    const result = db.prepare(query).run(id);

    if (result.changes === 0) {
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

    const market = req.body.market === "international" ? "international" : "saudi";
    const saudiPlatformMap = {
      "micro store": [
        "Google-projector",
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
        "Google",
        "Google Shopping",
        "TikTok",
        "Snapchat",
        "Meta",
        "karzoun",
      ],
      "zmord store": ["TikTok", "Google", "Google Shopping", "Snapchat", "Meta", "karzoun"],
      "alshahens store": ["TikTok", "TikTok-tracker", "Google", "Google Shopping", "Snapchat", "Meta", "karzoun"],
    };

    const internationalPlatformMap = {
      "birq store": [
        "Syria-Meta",
        "Iraq-Meta-S20",
        "Iraq-Meta-P10",
        "Iraq-Meta-K30",
        "Iraq-TikTok-S20",
        "Iraq-TikTok-P10",
        "Iraq-TikTok-K30",
        "Lebanon-Meta-S20",
        "Lebanon-Meta-P10",
      ],
      "alshahens store": [
        "Qatar-Google", "Qatar-TikTok", "Qatar-Snapchat", "Qatar-Meta",
        "Kuwait-Google", "Kuwait-TikTok", "Kuwait-TikTok-tracker", "Kuwait-Snapchat", "Kuwait-Meta",
        "Jordan-Google", "Jordan-TikTok", "Jordan-Snapchat", "Jordan-Meta",
        "Oman-Google", "Oman-TikTok", "Oman-Snapchat", "Oman-Meta",
        "Egypt-Google", "Egypt-TikTok", "Egypt-Snapchat", "Egypt-Meta",
        "Syria-Meta",
      ],
    };
    const platformMapByStore =
      market === "international" ? internationalPlatformMap : saudiPlatformMap;
    const stores = Object.keys(platformMapByStore);

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
              market, date, store, platform, ads_count, platform_sales, whatsapp_sales,
              unknown_sales, ad_spend, cost, content_cost, purchase_count, purchase_value,
              purchase_values_json, whatsapp_clicks, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `;

          const params = [
            market,
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

          db.prepare(query).run(...params);
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

function startServer() {
  try {
    // Test database connection
    db.prepare("SELECT CURRENT_TIMESTAMP").get();
    console.log("✓ Connected to local SQLite database");

    // Initialize database schema
    initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Sales Reporting System running at http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`  Database: SQLite (${databasePath})`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  db.close();
  process.exit(0);
});

// Start the server
startServer();
