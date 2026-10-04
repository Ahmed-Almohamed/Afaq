var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var jsonHeaders = { "content-type": "application/json; charset=utf-8" };
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}
__name(json, "json");
__name2(json, "json");
function marketFrom(value) {
  return value === "international" ? "international" : "saudi";
}
__name(marketFrom, "marketFrom");
__name2(marketFrom, "marketFrom");
function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
__name(number, "number");
__name2(number, "number");
function integer(value) {
  return Math.round(number(value));
}
__name(integer, "integer");
__name2(integer, "integer");
function googleCpc(body) {
  if (!String(body.platform || "").toLowerCase().includes("google")) return null;
  if (body.cpc == null || body.cpc === "") return null;
  const value = Number(body.cpc);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
__name(googleCpc, "googleCpc");
__name2(googleCpc, "googleCpc");
function processPurchaseValues(body, market) {
  const count = Math.max(0, integer(body.purchase_count));
  let values = Array.isArray(body.purchase_values) ? body.purchase_values.map(number) : [];
  if (values.length < count) values = values.concat(Array(count - values.length).fill(0));
  if (values.length > count) values = values.slice(0, count);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    count,
    countedCount: market === "international" ? count : values.filter((value) => value >= 400).length,
    values,
    total: sum || number(body.purchase_value)
  };
}
__name(processPurchaseValues, "processPurchaseValues");
__name2(processPurchaseValues, "processPurchaseValues");
async function bodyJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
__name(bodyJson, "bodyJson");
__name2(bodyJson, "bodyJson");
async function addRecord(request, env) {
  const body = await bodyJson(request);
  if (!body.date || !body.store) {
    return json({ error: "Date and store are required." }, 400);
  }
  const market = marketFrom(body.market);
  const purchases = processPurchaseValues(body, market);
  const result = await env.DB.prepare(`
    INSERT INTO sales (
      market, date, store, platform, ads_count, platform_sales, whatsapp_sales,
      unknown_sales, ad_spend, cost, content_cost, purchase_count, purchase_value,
      purchase_values_json, counted_purchase_count, whatsapp_clicks, cpc, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    market,
    String(body.date),
    String(body.store),
    String(body.platform || ""),
    integer(body.ads_count),
    integer(body.platform_sales),
    integer(body.whatsapp_sales),
    integer(body.unknown_sales),
    0,
    number(body.cost),
    number(body.content_cost),
    purchases.count,
    purchases.total,
    JSON.stringify(purchases.values),
    purchases.countedCount,
    integer(body.whatsapp_clicks),
    googleCpc(body)
  ).run();
  return json({ ok: true, id: result.meta.last_row_id }, 201);
}
__name(addRecord, "addRecord");
__name2(addRecord, "addRecord");
async function listRecords(url, env) {
  const market = marketFrom(url.searchParams.get("market"));
  const result = await env.DB.prepare(`
    SELECT * FROM sales
    WHERE market = ?
    ORDER BY date DESC, id DESC
  `).bind(market).all();
  return json(result.results || []);
}
__name(listRecords, "listRecords");
__name2(listRecords, "listRecords");
async function updateRecord(request, env, id) {
  const body = await bodyJson(request);
  if (!body.date || !body.store) {
    return json({ error: "Date and store are required." }, 400);
  }
  const market = marketFrom(body.market);
  const purchases = processPurchaseValues(body, market);
  const result = await env.DB.prepare(`
    UPDATE sales SET
      date = ?, store = ?, platform = ?, ads_count = ?, platform_sales = ?,
      whatsapp_sales = ?, unknown_sales = ?, ad_spend = ?, cost = ?,
      content_cost = ?, purchase_count = ?, purchase_value = ?,
      purchase_values_json = ?, counted_purchase_count = ?, whatsapp_clicks = ?, cpc = ?
    WHERE id = ? AND market = ?
  `).bind(
    String(body.date),
    String(body.store),
    String(body.platform || ""),
    integer(body.ads_count),
    integer(body.platform_sales),
    integer(body.whatsapp_sales),
    integer(body.unknown_sales),
    0,
    number(body.cost),
    number(body.content_cost),
    purchases.count,
    purchases.total,
    JSON.stringify(purchases.values),
    purchases.countedCount,
    integer(body.whatsapp_clicks),
    googleCpc(body),
    id,
    market
  ).run();
  if (!result.meta.changes) return json({ error: "Record not found." }, 404);
  return json({ ok: true, id });
}
__name(updateRecord, "updateRecord");
__name2(updateRecord, "updateRecord");
async function deleteRecord(env, id) {
  const result = await env.DB.prepare("DELETE FROM sales WHERE id = ?").bind(id).run();
  if (!result.meta.changes) return json({ error: "Record not found." }, 404);
  return json({ ok: true });
}
__name(deleteRecord, "deleteRecord");
__name2(deleteRecord, "deleteRecord");
async function deleteAll(url, env) {
  const market = marketFrom(url.searchParams.get("market"));
  const result = await env.DB.prepare("DELETE FROM sales WHERE market = ?").bind(market).run();
  return json({ ok: true, deletedCount: result.meta.changes || 0 });
}
__name(deleteAll, "deleteAll");
__name2(deleteAll, "deleteAll");
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
__name(randomInt, "randomInt");
__name2(randomInt, "randomInt");
function randomMoney(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}
__name(randomMoney, "randomMoney");
__name2(randomMoney, "randomMoney");
function sqlText(value) {
  return "'" + String(value).replaceAll("'", "''") + "'";
}
__name(sqlText, "sqlText");
__name2(sqlText, "sqlText");
function seedMaps(market) {
  if (market === "international") {
    return {
      "birq store": [
        "Syria-Meta-S20",
        "Syria-Meta-P10",
        "Iraq-Meta-S20",
        "Iraq-Meta-P10",
        "Iraq-Meta-K30",
        "Iraq-Meta-JC800P",
        "Iraq-TikTok-S20",
        "Iraq-TikTok-P10",
        "Iraq-TikTok-K30",
        "Lebanon-Meta-S20",
        "Lebanon-Meta-P10",
        "UAE-Snapchat-S20",
        "UAE-Snapchat-P10",
        "UAE-Snapchat-dashcam",
        "UAE-Google",
        "Qatar-Google",
        "Qatar-Snapchat-dashcam",
        "Kuwait-Google",
        "Gulf-Google"
      ],
      "alshahens store": [
        "Qatar-Google",
        "Qatar-TikTok",
        "Qatar-Snapchat",
        "Qatar-Meta",
        "Kuwait-Google",
        "Kuwait-TikTok",
        "Kuwait-TikTok-tracker",
        "Kuwait-Snapchat",
        "Kuwait-Meta",
        "Jordan-Google",
        "Jordan-TikTok",
        "Jordan-Snapchat",
        "Jordan-Meta",
        "Oman-Google",
        "Oman-TikTok",
        "Oman-Snapchat",
        "Oman-Meta",
        "Egypt-Google",
        "Egypt-TikTok",
        "Egypt-Snapchat",
        "Egypt-Meta",
        "UAE-TikTok",
        "Syria-Meta",
        "Syria-Meta-P10",
        "Yemen-Meta",
        "USA-Meta",
        "TikTok-sonar-device"
      ]
    };
  }
  return {
    "micro store": [
      "Google-projector",
      "TikTok-projector",
      "snapchat-projector",
      "Meta-projector",
      "Google",
      "Google Shopping",
      "TikTok",
      "Snapchat",
      "Meta",
      "karzoun"
    ],
    "birq store": ["Google", "Google Shopping", "TikTok", "Snapchat", "Meta", "karzoun"],
    "zmord store": ["TikTok", "Google", "Google Shopping", "Snapchat", "Meta", "karzoun"],
    "alshahens store": [
      "Gulf-Google",
      "TikTok",
      "TikTok-tracker",
      "Snapchat-tracker",
      "Google",
      "Google-tracker",
      "Google Shopping",
      "Snapchat",
      "Meta",
      "karzoun"
    ]
  };
}
__name(seedMaps, "seedMaps");
__name2(seedMaps, "seedMaps");
async function seedRecords(request, env) {
  const body = await bodyJson(request);
  const market = marketFrom(body.market);
  const platformsByStore = seedMaps(market);
  const today = /* @__PURE__ */ new Date();
  const statements = [];
  let recordsCreated = 0;
  for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - dayOffset);
    const dateString = date.toISOString().slice(0, 10);
    const rows = [];
    for (const [store, platforms] of Object.entries(platformsByStore)) {
      for (const platform of platforms) {
        const lower = platform.toLowerCase();
        const isKarzoun = platform === "karzoun";
        const isGoogle = lower.includes("google");
        const isSnap = lower.includes("snap");
        const cost = isKarzoun ? randomMoney(18, 55) : randomMoney(25, isGoogle ? 180 : 260);
        const ads = isKarzoun ? 0 : randomInt(0, 4);
        const platformSales = isKarzoun ? randomInt(0, 2) : randomInt(0, isSnap ? 5 : 4);
        const whatsappSales = isKarzoun ? randomInt(0, 1) : randomInt(0, isGoogle ? 2 : 3);
        const unknownSales = randomInt(0, 3);
        const purchaseCount = platformSales + whatsappSales;
        const values = Array.from({ length: purchaseCount }, () => randomMoney(120, 1450));
        const countedPurchaseCount = market === "international" ? purchaseCount : values.filter((value) => value >= 400).length;
        const contentCost = dayOffset % 10 === 0 && lower.includes("meta") ? randomMoney(80, 350) : 0;
        const purchaseValue = values.reduce((total, value) => total + value, 0);
        rows.push(`(
          ${sqlText(market)}, ${sqlText(dateString)}, ${sqlText(store)}, ${sqlText(platform)},
          ${ads}, ${platformSales}, ${whatsappSales}, ${unknownSales}, 0, ${cost},
          ${contentCost}, ${purchaseCount}, ${purchaseValue}, ${sqlText(JSON.stringify(values))},
          ${countedPurchaseCount},
          ${randomInt(0, isGoogle ? 45 : 18)}, CURRENT_TIMESTAMP
        )`);
        recordsCreated += 1;
      }
    }
    statements.push(env.DB.prepare(`
      INSERT INTO sales (
        market, date, store, platform, ads_count, platform_sales, whatsapp_sales,
        unknown_sales, ad_spend, cost, content_cost, purchase_count, purchase_value,
        purchase_values_json, counted_purchase_count, whatsapp_clicks, created_at
      ) VALUES ${rows.join(",")}
    `));
  }
  await env.DB.batch(statements);
  return json({ ok: true, recordsCreated });
}
__name(seedRecords, "seedRecords");
__name2(seedRecords, "seedRecords");
async function serveIndex(request, env) {
  const url = new URL(request.url);
  url.pathname = "/";
  return env.ASSETS.fetch(new Request(url, request));
}
__name(serveIndex, "serveIndex");
__name2(serveIndex, "serveIndex");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (request.method === "POST" && path === "/add") return addRecord(request, env);
      if (request.method === "GET" && path === "/data") return listRecords(url, env);
      if (request.method === "DELETE" && path === "/delete-all") return deleteAll(url, env);
      if (request.method === "POST" && path === "/seed") return seedRecords(request, env);
      if (request.method === "GET" && (path === "/saudi" || path === "/international")) {
        return serveIndex(request, env);
      }
      const updateMatch = path.match(/^\/update\/(\d+)$/);
      if (request.method === "PUT" && updateMatch) {
        return updateRecord(request, env, Number(updateMatch[1]));
      }
      const deleteMatch = path.match(/^\/delete\/(\d+)$/);
      if (request.method === "DELETE" && deleteMatch) {
        return deleteRecord(env, Number(deleteMatch[1]));
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("AFAQ Worker error:", error);
      return json({ error: "Unexpected server error." }, 500);
    }
  }
};
export {
  worker_default as default
};
