(function () {
  const currentMarket = window.location.pathname === "/international" ? "international" : "saudi";
  document.body.dataset.market = currentMarket;
  const langSelect = document.getElementById("lang-select");
  const form = document.getElementById("sales-form");
  const banner = document.getElementById("banner");
  const submitBtn = document.getElementById("submit-btn");
  const totalSalesEl = document.getElementById("total-sales");
  const valueCostRatioEl = document.getElementById("value-cost-ratio");
  const costPerPurchaseEl = document.getElementById("cost-per-purchase");
  const recordsBody = document.getElementById("records-body");
  const recordsWrap = document.getElementById("records-wrap");
  const recordsHint = document.getElementById("records-hint");
  const exportBtn = document.getElementById("export-btn");
  const seedBtn = document.getElementById("seed-btn");
  const deleteAllBtn = document.getElementById("delete-all-btn");
  const exportTypeSelect = document.getElementById("export-type");
  const exportStartDateInput = document.getElementById("export-start-date");
  const exportEndDateInput = document.getElementById("export-end-date");
  const exportStoreSelect = document.getElementById("export-store");
  const historyStoreSelect = document.getElementById("history-store");
  const historyPlatformSelect = document.getElementById("history-platform");
  const historyRecordSelect = document.getElementById("history-record");
  const historyLoadBtn = document.getElementById("history-load-btn");
  const storeSelect = document.getElementById("store");
  const platformSelect = document.getElementById("platform");
  const purchaseValuesContainer = document.getElementById("purchase-values-container");
  const supplementModal = document.getElementById("supplement-modal");
  const supplementTitle = document.getElementById("supplement-title");
  const supplementSubtitle = document.getElementById("supplement-subtitle");
  const supplementPasteBlock = document.getElementById("supplement-paste-block");
  const supplementPaste = document.getElementById("supplement-paste");
  const supplementPreview = document.getElementById("supplement-preview");
  const supplementCancel = document.getElementById("supplement-cancel");
  const supplementSkip = document.getElementById("supplement-skip");
  const supplementContinue = document.getElementById("supplement-continue");
  let currentLang = localStorage.getItem("sales_lang") || "en";
  let lastRenderedPurchaseCount = -1;
  let cachedAllRows = [];
  let editingRecordId = null;

  const storeLabels = {
    "micro store": { en: "micro store", ar: "متجر مايكرو" },
    "zmord store": { en: "zmord store", ar: "متجر زمرد" },
    "birq store": { en: "birq store", ar: "متجر بيرق" },
    "alshahens store": { en: "alshahens store", ar: "متجر الشاهين" },
  };

  const platformLabels = {
    Meta: { en: "Meta", ar: "ميتا" },
    TikTok: { en: "TikTok", ar: "تيك توك" },
    Google: { en: "Google", ar: "جوجل" },
    Snapchat: { en: "Snapchat", ar: "سناب شات" },
    "Google Shopping": { en: "Google Shopping", ar: "جوجل شوبينغ" },
    karzoun: { en: "karzoun", ar: "كرزون" },
    "google iraq": { en: "google iraq", ar: "جوجل العراق" },
    "meta iraq": { en: "meta iraq", ar: "ميتا العراق" },
    "meta iraq k30": { en: "meta iraq k30", ar: "ميتا العراق (k30)" },
    "meta iraq jc800p": { en: "meta iraq jc800p", ar: "ميتا العراق (jc800p)" },
    "meta uae k30": { en: "meta uae k30", ar: "ميتا الامارات (k30)" },
    "meta uae jc800p": { en: "meta uae jc800p", ar: "ميتا الامارات (jc800p)" },
    "meta syria k30": { en: "meta syria k30", ar: "ميتا سوريا (k30)" },
    "meta syria jc800p": { en: "meta syria jc800p", ar: "ميتا سوريا (jc800p)" },
    "TikTok-projector": { en: "TikTok-projector", ar: "تيك توك - بروجكتور" },
    "snapchat-projector": { en: "snapchat-projector", ar: "سناب شات - بروجكتور" },
    "Google-projector": { en: "Google-projector", ar: "جوجل بروجيكتور" },
    "TikTok-tracker": { en: "TikTok tracker", ar: "تيك توك جهاز التتبع" },
    "TikTok-viofo": { en: "TikTok-viofo", ar: "تيك توك - فيوفو" },
    "snapchat-viofo": { en: "snapchat-viofo", ar: "سناب شات - فيوفو" },
  };

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
    currentMarket === "international" ? internationalPlatformMap : saudiPlatformMap;
  const marketStores =
    currentMarket === "international"
      ? ["birq store", "alshahens store"]
      : ["micro store", "zmord store", "birq store", "alshahens store"];

  const countryLabels = {
    Syria: { en: "Syria", ar: "سوريا" },
    Iraq: { en: "Iraq", ar: "العراق" },
    Lebanon: { en: "Lebanon", ar: "لبنان" },
    Qatar: { en: "Qatar", ar: "قطر" },
    Kuwait: { en: "Kuwait", ar: "الكويت" },
    Jordan: { en: "Jordan", ar: "الأردن" },
    Oman: { en: "Oman", ar: "عمان" },
    Egypt: { en: "Egypt", ar: "مصر" },
  };

  function getPlatformLabel(value, lang = currentLang) {
    if (platformLabels[value]) return platformLabels[value][lang];
    const parts = String(value).split("-");
    const country = countryLabels[parts[0]];
    if (!country) return value;
    const channelNames = {
      Meta: { en: "Meta", ar: "ميتا" },
      TikTok: { en: "TikTok", ar: "تيك توك" },
      Google: { en: "Google", ar: "جوجل" },
      Snapchat: { en: "Snapchat", ar: "سناب شات" },
      tracker: { en: "tracking device", ar: "جهاز التتبع" },
    };
    const channel = channelNames[parts[1]] ? channelNames[parts[1]][lang] : parts[1];
    const detail = parts.slice(2).map((part) =>
      channelNames[part] ? channelNames[part][lang] : part
    ).join(" ");
    return [country[lang], channel, detail].filter(Boolean).join(" - ");
  }

  const defaultPlatformOrder = [
    "Meta",
    "TikTok",
    "Google",
    "Snapchat",
    "Google Shopping",
  ];

  function getPlatformsForStore(storeKey) {
    if (!storeKey) return [];
    return platformMapByStore[storeKey] || defaultPlatformOrder;
  }

  function getNextPlatformForStore(storeKey, currentPlatform) {
    const list = getPlatformsForStore(storeKey);
    if (!list.length) return "";
    if (!currentPlatform) return list[0] || "";
    const idx = list.indexOf(currentPlatform);
    if (idx === -1) return list[0] || "";
    if (idx + 1 < list.length) return list[idx + 1];
    return "";
  }

  function clearEntryFieldsForNextPlatform() {
    const ids = [
      "ads_count",
      "platform_sales",
      "whatsapp_sales",
      "unknown_sales",
      "cost",
      "content_cost",
      "whatsapp_clicks",
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }

  const i18n = {
    en: {
      pageTitle: "Afaq",
      language: "Language",
      title: "Afaq",
      subtitle: "Sales reporting",
      saudiPage: "Saudi Arabia",
      internationalPage: "International expansion",
      saudiSubtitle: "Saudi Arabia sales reporting",
      internationalSubtitle: "International expansion sales reporting",
      newEntry: "New entry",
      date: "Date",
      store: "Store",
      selectStore: "Select store",
      platform: "Platform",
      selectPlatform: "Select platform",
      adsCount: "Ads count",
      platformSales: "Platform purchases",
      whatsappSales: "WhatsApp purchases",
      unknownSales: "Unknown purchases",
      cost: "Cost",
      contentCost: "Content production cost",
      purchaseCount: "Total purchases (auto)",
      purchaseValue: "Purchase values",
      purchaseValueItem: "Purchase value",
      whatsappClicks: "WhatsApp clicks",
      totalSales: "Total purchases",
      valueCostRatio: "Value / cost (≥7 = ✅)",
      costPerPurchase: "Cost per purchase",
      roas: "ROAS (معدل البيع)",
      saveEntry: "Save entry",
      savedRecords: "Saved records",
      loading: "Loading…",
      noRecords: "No records yet.",
      recordsCount: (n) => `${n} record(s)`,
      couldNotLoad: "Could not load records.",
      needDateStore: "Please set date and store.",
      couldNotSave: "Could not save. Try again.",
      savedSuccess: "Entry saved successfully.",
      networkError: "Network error. Is the server running?",
      footer: "Sales Reporting System · local",
      thDate: "Date",
      thStore: "Store",
      thPlatform: "Platform",
      thAds: "Ads",
      thPlatformSales: "P. pur.",
      thWa: "WA pur.",
      thUnk: "Unk pur.",
      thCost: "Cost",
      thPurchaseCount: "Purchases",
      thPurchaseValue: "P. value",
      thCpp: "CPP",
      thClicks: "Clicks",
      thRatioDays: "Value/cost streak",
      thRoas: "ROAS",
      thAction: "Action",
      delete: "Delete",
      deleting: "Deleting...",
      deletedSuccess: "Record deleted successfully.",
      couldNotDelete: "Could not delete record.",
      confirmDelete: "Delete this record?",
      reportType: "Report type",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      custom: "Custom",
      date: "Date",
      week: "Week",
      month: "Month",
      from: "From",
      to: "To",
      exportReport: "Export report",
      exportStoreLabel: "Export store",
      exportStoreAll: "All stores",
      exportNeedPeriod: "Please select a period to export.",
      exportFailed: "Could not export report.",
      exportByPeriodLabel: "Export by saved period",
      selectExportPeriod: "Select period",
      exportSelectedPeriod: "Export",
      exportPickPeriod: "Choose a period to export.",
      loadSavedTitle: "Load saved entry",
      loadSavedBtn: "Load into form",
      loadSavedRecordLabel: "Record",
      selectRecord: "Select record",
      selectRecordFirst: "Choose store, platform, and a record.",
      loadedForEdit: "Loaded into the form. Save updates the record.",
      updateEntry: "Update entry",
      updatedSuccess: "Record updated.",
      seedBtn: "Generate 30-day test data",
      seedRunning: "Generating test data...",
      seedSuccess: (n) => `Generated ${n} test records.`,
      seedFailed: "Could not generate test data.",
      deleteAllBtn: "Delete all history",
      deleteAllRunning: "Deleting all history...",
      confirmDeleteAll: "Delete ALL saved history? This cannot be undone.",
      deleteAllSuccess: "All history was deleted.",
      deleteAllFailed: "Could not delete all history.",
    },
    ar: {
      pageTitle: "افاق",
      language: "اللغة",
      title: "افاق",
      subtitle: "تقارير المبيعات",
      saudiPage: "السعودية",
      internationalPage: "التوسع الدولي",
      saudiSubtitle: "تقارير مبيعات السعودية",
      internationalSubtitle: "تقارير التوسع الدولي",
      newEntry: "إدخال جديد",
      date: "التاريخ",
      store: "المتجر",
      selectStore: "اختر المتجر",
      platform: "المنصة",
      selectPlatform: "اختر المنصة",
      adsCount: "عدد الإعلانات",
      platformSales: "مشتريات المنصة",
      whatsappSales: "مشتريات واتساب",
      unknownSales: "مشتريات غير معروفة",
      cost: "التكلفة",
      contentCost: "تكلفة صناعة المحتوى",
      purchaseCount: "إجمالي المشتريات (تلقائي)",
      purchaseValue: "قيم المبيع",
      purchaseValueItem: "قيمة المبيع",
      whatsappClicks: "نقرات واتساب",
      totalSales: "إجمالي المشتريات",
      valueCostRatio: "قيمة المبيع / التكلفة (≥7 = ✅)",
      costPerPurchase: "تكلفة الشراء",
      roas: "معدل البيع (ROAS)",
      saveEntry: "حفظ الإدخال",
      savedRecords: "السجلات المحفوظة",
      loading: "جار التحميل…",
      noRecords: "لا توجد سجلات بعد.",
      recordsCount: (n) => `${n} سجل`,
      couldNotLoad: "تعذر تحميل السجلات.",
      needDateStore: "يرجى تحديد التاريخ والمتجر.",
      couldNotSave: "تعذر الحفظ. حاول مرة أخرى.",
      savedSuccess: "تم حفظ الإدخال بنجاح.",
      networkError: "خطأ في الشبكة. هل الخادم يعمل؟",
      footer: "نظام تقارير المبيعات · محلي",
      thDate: "التاريخ",
      thStore: "المتجر",
      thPlatform: "المنصة",
      thAds: "الإعلانات",
      thPlatformSales: "م. مشتريات",
      thWa: "واتس مشتريات",
      thUnk: "غير معروف",
      thCost: "التكلفة",
      thPurchaseCount: "عدد المبيعات",
      thPurchaseValue: "قيمة المبيع",
      thCpp: "تكلفة الشراء",
      thClicks: "النقرات",
      thRatioDays: "تسلسل قيمة/تكلفة",
      thRoas: "معدل البيع",
      thAction: "إجراء",
      delete: "حذف",
      deleting: "جار الحذف...",
      deletedSuccess: "تم حذف السجل بنجاح.",
      couldNotDelete: "تعذر حذف السجل.",
      confirmDelete: "هل تريد حذف هذا السجل؟",
      reportType: "نوع التقرير",
      daily: "يومي",
      weekly: "أسبوعي",
      monthly: "شهري",
      custom: "مخصص",
      date: "التاريخ",
      week: "الأسبوع",
      month: "الشهر",
      from: "من",
      to: "إلى",
      exportReport: "تصدير التقرير",
      exportStoreLabel: "متجر التصدير",
      exportStoreAll: "كل المتاجر",
      exportNeedPeriod: "يرجى اختيار الفترة للتصدير.",
      exportFailed: "تعذر تصدير التقرير.",
      exportByPeriodLabel: "تصدير حسب الفترة المحفوظة",
      selectExportDay: "اختر اليوم",
      exportSelectedDay: "تصدير",
      exportPickDay: "اختر اليوم للتصدير.",
      loadSavedTitle: "تحميل إدخال محفوظ",
      loadSavedBtn: "تحميل إلى النموذج",
      loadSavedRecordLabel: "السجل",
      selectRecord: "اختر السجل",
      selectRecordFirst: "اختر المتجر والمنصة والسجل.",
      loadedForEdit: "تم التحميل في النموذج. الحفظ يحدّث السجل.",
      updateEntry: "تحديث الإدخال",
      updatedSuccess: "تم تحديث السجل.",
      seedBtn: "توليد بيانات اختبار 30 يوم",
      seedRunning: "جاري توليد بيانات الاختبار...",
      seedSuccess: (n) => `تم توليد ${n} سجل اختبار.`,
      seedFailed: "تعذر توليد بيانات الاختبار.",
      deleteAllBtn: "حذف كل السجل",
      deleteAllRunning: "جار حذف كل السجل...",
      confirmDeleteAll: "هل تريد حذف كل السجل المحفوظ؟ لا يمكن التراجع عن هذا الإجراء.",
      deleteAllSuccess: "تم حذف كل السجل بنجاح.",
      deleteAllFailed: "تعذر حذف كل السجل.",
    },
  };

  function t(key) {
    const value = i18n[currentLang][key];
    return typeof value === "function" ? value : value || "";
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setLanguage(lang) {
    currentLang = lang === "ar" ? "ar" : "en";
    localStorage.setItem("sales_lang", currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.title = t("pageTitle");
    setText("lang-label", t("language"));
    setText("title-text", t("title"));
    setText(
      "subtitle-text",
      currentMarket === "international" ? t("internationalSubtitle") : t("saudiSubtitle")
    );
    setText("nav-saudi", t("saudiPage"));
    setText("nav-international", t("internationalPage"));
    setText("new-entry-title", t("newEntry"));
    setText("label-date", t("date"));
    setText("label-store", t("store"));
    setText("select-store-option", t("selectStore"));
    setText("label-platform", t("platform"));
    setText("select-platform-option", t("selectPlatform"));
    setText("label-ads-count", t("adsCount"));
    setText("label-platform-sales", t("platformSales"));
    setText("label-whatsapp-sales", t("whatsappSales"));
    setText("label-unknown-sales", t("unknownSales"));
    setText("label-cost", t("cost"));
    setText("label-content-cost", t("contentCost"));
    setText("label-purchase-count", t("purchaseCount"));
    setText("label-purchase-value", t("purchaseValue"));
    setText("label-whatsapp-clicks", t("whatsappClicks"));
    setText("label-total-sales", t("totalSales"));
    setText("label-value-cost-ratio", t("valueCostRatio"));
    setText("label-cost-per-purchase", t("costPerPurchase"));
    setText("label-roas", t("roas"));
    setText("submit-btn", t("saveEntry"));
    setText("saved-records-title", t("savedRecords"));
    setText("th-date", t("thDate"));
    setText("th-store", t("thStore"));
    setText("th-platform", t("thPlatform"));
    setText("th-ads", t("thAds"));
    setText("th-platform-sales", t("thPlatformSales"));
    setText("th-wa", t("thWa"));
    setText("th-unk", t("thUnk"));
    setText("th-cost", t("thCost"));
    setText("th-purchase-count", t("thPurchaseCount"));
    setText("th-purchase-value", t("thPurchaseValue"));
    setText("th-cpp", t("thCpp"));
    setText("th-clicks", t("thClicks"));
    setText("th-roas-days", t("thRatioDays"));
    setText("th-roas", t("thRoas"));
    setText("th-action", t("thAction"));
    setText("label-export-type", t("reportType"));
    setText("export-type-daily", t("daily"));
    setText("export-type-weekly", t("weekly"));
    setText("export-type-monthly", t("monthly"));
    setText("label-export-start-date", t("from"));
    setText("label-export-end-date", t("to"));
    setText("export-btn", t("exportReport"));
    setText("label-export-store", t("exportStoreLabel"));
    setText("export-store-all-option", t("exportStoreAll"));
    setText("export-by-day-label", t("exportByPeriodLabel"));
    setText("export-day-placeholder", t("selectExportPeriod"));
    setText("export-day-btn", t("exportSelectedPeriod"));
    setText("load-saved-title", t("loadSavedTitle"));
    setText("seed-btn", t("seedBtn"));
    setText("delete-all-btn", t("deleteAllBtn"));
    updateChoiceLabels();
    loadRecords();
  }

  function updateChoiceLabels() {
    if (storeSelect) {
      Array.from(storeSelect.options).forEach((option) => {
        if (!option.value || !storeLabels[option.value]) return;
        option.textContent = storeLabels[option.value][currentLang];
      });
    }
    if (exportStoreSelect) {
      Array.from(exportStoreSelect.options).forEach((option) => {
        if (!option.value || !storeLabels[option.value]) return;
        option.textContent = storeLabels[option.value][currentLang];
      });
    }
    if (historyStoreSelect) {
      Array.from(historyStoreSelect.options).forEach((option) => {
        if (!option.value || !storeLabels[option.value]) return;
        option.textContent = storeLabels[option.value][currentLang];
      });
      const h0 = document.getElementById("history-store-placeholder");
      if (h0) h0.textContent = t("selectStore");
    }
    refreshPlatformOptions();
    refreshHistoryPlatformOptions();
    refreshHistoryRecordOptions();
    updateCalculations();
  }

  function populateMarketStoreOptions() {
    const configs = [
      { select: storeSelect, placeholderId: "select-store-option" },
      { select: historyStoreSelect, placeholderId: "history-store-placeholder" },
      { select: exportStoreSelect, placeholderId: "export-store-all-option" },
    ];
    configs.forEach(({ select, placeholderId }) => {
      if (!select) return;
      const placeholder = select.querySelector('option[value=""]');
      select.innerHTML = "";
      if (placeholder) {
        placeholder.id = placeholderId;
        select.appendChild(placeholder);
      }
      marketStores.forEach((store) => {
        const option = document.createElement("option");
        option.value = store;
        option.textContent = storeLabels[store]?.[currentLang] || store;
        select.appendChild(option);
      });
    });
  }

  function refreshHistoryPlatformOptions() {
    if (!historyPlatformSelect || !historyStoreSelect) return;
    const selectedStore = historyStoreSelect.value;
    const allowedPlatforms = getPlatformsForStore(selectedStore);
    const prev = historyPlatformSelect.value;
    historyPlatformSelect.innerHTML = "";
    const defPl = document.createElement("option");
    defPl.value = "";
    defPl.id = "history-platform-placeholder";
    defPl.textContent = t("selectPlatform");
    historyPlatformSelect.appendChild(defPl);
    allowedPlatforms.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = getPlatformLabel(value);
      historyPlatformSelect.appendChild(option);
    });
    if (allowedPlatforms.includes(prev)) historyPlatformSelect.value = prev;
  }

  function refreshHistoryRecordOptions() {
    if (!historyRecordSelect) return;
    const store = historyStoreSelect ? historyStoreSelect.value : "";
    const plat = historyPlatformSelect ? historyPlatformSelect.value : "";
    historyRecordSelect.innerHTML = "";
    const defR = document.createElement("option");
    defR.value = "";
    defR.id = "history-record-placeholder";
    defR.textContent = t("selectRecord");
    historyRecordSelect.appendChild(defR);
    if (!store || !plat) return;
    const matches = cachedAllRows
      .filter((r) => r.store === store && r.platform === plat)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    const perDate = {};
    matches.forEach((r) => {
      perDate[r.date] = (perDate[r.date] || 0) + 1;
    });
    matches.forEach((r) => {
      const option = document.createElement("option");
      option.value = String(r.id);
      let label = r.date;
      if (perDate[r.date] > 1) label = `${r.date} (#${r.id})`;
      option.textContent = label;
      historyRecordSelect.appendChild(option);
    });
  }

  function refreshSubmitLabel() {
    if (submitBtn) submitBtn.textContent = editingRecordId ? t("updateEntry") : t("saveEntry");
  }

  function applyRowToForm(row) {
    if (!row) return;
    editingRecordId = row.id;
    const dateEl = document.getElementById("date");
    if (dateEl) dateEl.value = row.date || "";
    if (storeSelect) {
      storeSelect.value = row.store || "";
      refreshPlatformOptions();
    }
    if (platformSelect) platformSelect.value = row.platform || "";
    const setField = (id, v) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (v === 0 || v === "0") {
        el.value = "0";
        return;
      }
      el.value = v != null && v !== "" ? String(v) : "";
    };
    setField("ads_count", row.ads_count);
    setField("platform_sales", row.platform_sales);
    setField("whatsapp_sales", row.whatsapp_sales);
    setField("unknown_sales", row.unknown_sales);
    setField("cost", row.cost);
    setField("content_cost", row.content_cost);
    setField("whatsapp_clicks", row.whatsapp_clicks);
    lastRenderedPurchaseCount = -1;
    updateCalculations();
    let vals = parsePurchaseValuesFromRow(row);
    const cnt = Number(row.purchase_count || 0);
    if (vals.length < cnt) {
      vals = vals.concat(Array(cnt - vals.length).fill(0));
    } else if (vals.length > cnt) {
      vals = vals.slice(0, cnt);
    }
    const pvInputs = purchaseValuesContainer
      ? purchaseValuesContainer.querySelectorAll(".purchase-value-input")
      : [];
    pvInputs.forEach((inp, i) => {
      const x = vals[i];
      inp.value = x !== undefined && Number.isFinite(Number(x)) ? String(x) : "";
    });
    updateCalculations();
    if (historyStoreSelect) {
      historyStoreSelect.value = row.store || "";
      refreshHistoryPlatformOptions();
      if (historyPlatformSelect) historyPlatformSelect.value = row.platform || "";
      refreshHistoryRecordOptions();
      if (historyRecordSelect) historyRecordSelect.value = String(row.id);
    }
    refreshSubmitLabel();
  }

  function refreshPlatformOptions() {
    if (!platformSelect) return;
    const selectedStore = storeSelect ? storeSelect.value : "";
    const allowedPlatforms = getPlatformsForStore(selectedStore);
    const prev = platformSelect.value;
    platformSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.id = "select-platform-option";
    defaultOption.textContent = t("selectPlatform");
    platformSelect.appendChild(defaultOption);

    allowedPlatforms.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = getPlatformLabel(value);
      platformSelect.appendChild(option);
    });

    if (allowedPlatforms.includes(prev)) {
      platformSelect.value = prev;
    }
  }

  const numericIds = [
    "ads_count",
    "platform_sales",
    "whatsapp_sales",
    "unknown_sales",
    "cost",
    "whatsapp_clicks",
  ];

  function parseNum(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const v = parseFloat(String(el.value).replace(",", "."), 10);
    return Number.isFinite(v) ? v : 0;
  }

  function getComputedPurchaseCount() {
    return (
      Math.max(0, Math.round(parseNum("platform_sales"))) +
      Math.max(0, Math.round(parseNum("whatsapp_sales"))) +
      Math.max(0, Math.round(parseNum("unknown_sales")))
    );
  }

  function syncPurchaseCountField() {
    const el = document.getElementById("purchase_count");
    if (!el) return;
    const n = getComputedPurchaseCount();
    el.value = n > 0 ? String(n) : "";
  }

  function updateCalculations() {
    syncPurchaseCountField();
    const purchaseCount = getComputedPurchaseCount();
    if (purchaseCount !== lastRenderedPurchaseCount) {
      lastRenderedPurchaseCount = purchaseCount;
      renderPurchaseValueInputs();
    }

    const platformSales = parseNum("platform_sales");
    const whatsappSales = parseNum("whatsapp_sales");
    const unknownSales = parseNum("unknown_sales");
    const cost = parseNum("cost");
    const purchaseValueTotal = getPurchaseValuesTotal();

    const total = platformSales + whatsappSales + unknownSales;
    totalSalesEl.textContent = String(Math.round(total));

    const ratio = getValueCostRatio(purchaseValueTotal, cost);
    const dateStr = document.getElementById("date") ? String(document.getElementById("date").value).trim() : "";
    const store = storeSelect ? storeSelect.value : "";
    const platform = platformSelect ? platformSelect.value : "";
    const streakIndex = buildStorePlatformDateIndex(cachedAllRows);
    let disp = { marks: "📌", count: 0, kind: "pin" };
    if (dateStr && store && platform) {
      disp = getStreakDisplay(streakIndex, store, platform, dateStr, {
        useDraft: true,
        draftRatio: ratio,
      });
    }
    if (valueCostRatioEl) {
      if (ratio == null) {
        valueCostRatioEl.textContent = "—";
      } else {
        valueCostRatioEl.textContent = `${ratio.toFixed(2)} ${disp.marks}`;
      }
    }

    if (purchaseCount <= 0) {
      costPerPurchaseEl.textContent = "—";
    } else {
      costPerPurchaseEl.textContent = (cost / purchaseCount).toFixed(2);
    }

    const roasEl = document.getElementById("roas-value");
    if (roasEl) {
      const roasVal = cost > 0 ? purchaseValueTotal / cost : null;
      roasEl.textContent = roasVal != null ? roasVal.toFixed(2) : "—";
    }

    // Show dynamic purchase total in table/export source field semantics.
    const pvLabel = document.getElementById("label-purchase-value");
    if (pvLabel) {
      pvLabel.textContent = `${t("purchaseValue")} (${purchaseValueTotal.toFixed(2)})`;
    }
  }

  function collectPurchaseValuesArray() {
    if (!purchaseValuesContainer) return [];
    const inputs = purchaseValuesContainer.querySelectorAll(".purchase-value-input");
    return Array.from(inputs).map((input) => {
      const v = parseFloat(String(input.value).replace(",", "."));
      return Number.isFinite(v) ? v : 0;
    });
  }

  function getPurchaseValuesTotal() {
    return collectPurchaseValuesArray().reduce((a, b) => a + b, 0);
  }

  function parsePurchaseValuesFromRow(row) {
    if (!row || row.purchase_values_json == null || row.purchase_values_json === "") return [];
    try {
      const arr = JSON.parse(row.purchase_values_json);
      if (!Array.isArray(arr)) return [];
      return arr.map((v) => Number(v)).filter((n) => Number.isFinite(n));
    } catch {
      return [];
    }
  }

  function getRowPurchaseValueTotal(row) {
    const fromJson = parsePurchaseValuesFromRow(row);
    if (fromJson.length) return fromJson.reduce((a, b) => a + b, 0);
    return Number(row.purchase_value || 0);
  }

  function getValueCostRatio(purchaseValueTotal, cost) {
    const c = Number(cost || 0);
    if (c <= 0) return null;
    const v = Number(purchaseValueTotal || 0);
    return v / c;
  }

  function valueCostRatioFromRow(row) {
    return getValueCostRatio(getRowPurchaseValueTotal(row), row.cost);
  }

  function formatPurchaseExportValue(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "0";
    if (Math.abs(x - Math.round(x)) < 1e-6) return String(Math.round(x));
    return x.toFixed(2);
  }

  function flattenPurchaseValuesForExport(rows) {
    const out = [];
    rows.forEach((r) => {
      let vals = parsePurchaseValuesFromRow(r);
      const cnt = Number(r.purchase_count || 0);
      if (vals.length && cnt > 0 && vals.length !== cnt) {
        if (vals.length < cnt) {
          vals = vals.concat(Array(cnt - vals.length).fill(0));
        } else {
          vals = vals.slice(0, cnt);
        }
      }
      if (vals.length) {
        vals.forEach((v) => {
          if (!Number.isFinite(v)) return;
          out.push(v);
        });
        return;
      }
      const fallback = Number(r.purchase_value || 0);
      if (fallback > 0) {
        if (cnt > 1) {
          const each = fallback / cnt;
          for (let i = 0; i < cnt; i += 1) out.push(each);
        } else {
          out.push(fallback);
        }
      }
    });
    return out;
  }

  function parseYMDLocal(dateStr) {
    const parts = String(dateStr || "").trim().split("-");
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const mo = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  function formatYMDLocal(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addDaysLocal(dt, deltaDays) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + deltaDays);
  }

  function spDateKey(storeKey, platformKey, dateStr) {
    return `${storeKey}\t${platformKey}\t${dateStr}`;
  }

  function buildStorePlatformDateIndex(allRows) {
    const map = new Map();
    allRows.forEach((r) => {
      const k = spDateKey(r.store, r.platform, r.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return map;
  }

  function getMergedRatioForDay(index, storeKey, platformKey, dateStr) {
    const rows = index.get(spDateKey(storeKey, platformKey, dateStr));
    if (!rows || !rows.length) return null;
    const totalVal = rows.reduce((acc, row) => acc + getRowPurchaseValueTotal(row), 0);
    const totalCost = rows.reduce((acc, row) => acc + Number(row.cost || 0), 0);
    return getValueCostRatio(totalVal, totalCost);
  }

  /** 'missing' = no row that day; 'good' = value/cost ≥ 7; 'pin' = has data but ratio &lt; 7 or undefined */
  function getDayOutcome(index, storeKey, platformKey, dateStr) {
    const rows = index.get(spDateKey(storeKey, platformKey, dateStr));
    if (!rows || !rows.length) return "missing";
    const ratio = getMergedRatioForDay(index, storeKey, platformKey, dateStr);
    if (ratio == null || ratio < 7) return "pin";
    return "good";
  }

  function outcomeFromRatio(ratio) {
    if (ratio == null || ratio < 7) return "pin";
    return "good";
  }

  function consecutiveGoodStreak(index, storeKey, platformKey, endDateStr, options) {
    const start = parseYMDLocal(endDateStr);
    if (!start) return 0;
    const endNorm = formatYMDLocal(start);
    let streak = 0;
    let first = true;
    let d = start;

    while (true) {
      const key = formatYMDLocal(d);
      let outcome;
      if (first && key === endNorm && options && options.useDraft) {
        outcome = outcomeFromRatio(options.draftRatio);
      } else {
        outcome = getDayOutcome(index, storeKey, platformKey, key);
      }
      if (outcome !== "good") break;
      streak += 1;
      first = false;
      d = addDaysLocal(d, -1);
    }
    return streak;
  }

  /** Consecutive pin days (ratio &lt; 7); calendar gaps ('missing') stop the streak — not counted as pin. */
  function consecutivePinStreak(index, storeKey, platformKey, endDateStr, options) {
    const start = parseYMDLocal(endDateStr);
    if (!start) return 0;
    const endNorm = formatYMDLocal(start);
    let streak = 0;
    let first = true;
    let d = start;

    while (true) {
      const key = formatYMDLocal(d);
      let outcome;
      if (first && key === endNorm && options && options.useDraft) {
        outcome = outcomeFromRatio(options.draftRatio);
      } else {
        outcome = getDayOutcome(index, storeKey, platformKey, key);
      }
      if (outcome === "missing") break;
      if (outcome !== "pin") break;
      streak += 1;
      first = false;
      d = addDaysLocal(d, -1);
    }
    return streak;
  }

  function getStreakDisplay(index, storeKey, platformKey, endDateStr, options) {
    const start = parseYMDLocal(endDateStr);
    if (!start) return { marks: "📌", count: 0, kind: "pin" };

    let endOutcome;
    if (options && options.useDraft) {
      endOutcome = outcomeFromRatio(options.draftRatio);
    } else {
      endOutcome = getDayOutcome(index, storeKey, platformKey, endDateStr);
    }

    if (endOutcome === "good") {
      const n = consecutiveGoodStreak(index, storeKey, platformKey, endDateStr, options);
      return { marks: "✅".repeat(Math.max(1, n)), count: n, kind: "good" };
    }
    if (endOutcome === "missing") {
      return { marks: "📌", count: 0, kind: "pin" };
    }

    const n = consecutivePinStreak(index, storeKey, platformKey, endDateStr, options);
    const markLen = Math.max(1, n);
    return { marks: "📌".repeat(markLen), count: n, kind: "pin" };
  }

  function renderPurchaseValueInputs() {
    if (!purchaseValuesContainer) return;
    const count = Math.max(0, Math.min(50, getComputedPurchaseCount()));
    const prevValues = Array.from(
      purchaseValuesContainer.querySelectorAll(".purchase-value-input")
    ).map((el) => el.value);
    purchaseValuesContainer.innerHTML = "";

    for (let i = 0; i < count; i += 1) {
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.step = "0.01";
      input.inputMode = "decimal";
      input.className = "purchase-value-input";
      input.placeholder = `${t("purchaseValueItem")} #${i + 1}`;
      input.value = prevValues[i] || "";
      input.addEventListener("input", updateCalculations);
      purchaseValuesContainer.appendChild(input);
    }
  }

  function showBanner(message, type) {
    banner.hidden = false;
    banner.textContent = message;
    banner.className = "banner " + (type === "error" ? "error" : "success");
  }

  function hideBannerSoon() {
    window.setTimeout(() => {
      banner.hidden = true;
      banner.textContent = "";
      banner.className = "banner";
    }, 5000);
  }

  numericIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateCalculations);
      el.addEventListener("change", updateCalculations);
    }
  });

  if (storeSelect) {
    storeSelect.addEventListener("change", () => {
      refreshPlatformOptions();
      updateCalculations();
    });
  }

  if (platformSelect) {
    platformSelect.addEventListener("change", updateCalculations);
  }

  const dateInputForCalc = document.getElementById("date");
  if (dateInputForCalc) {
    dateInputForCalc.addEventListener("change", updateCalculations);
  }

  if (historyStoreSelect) {
    historyStoreSelect.addEventListener("change", () => {
      refreshHistoryPlatformOptions();
      refreshHistoryRecordOptions();
    });
  }
  if (historyPlatformSelect) {
    historyPlatformSelect.addEventListener("change", refreshHistoryRecordOptions);
  }
  if (historyLoadBtn) {
    historyLoadBtn.addEventListener("click", () => {
      const rid = historyRecordSelect ? Number(historyRecordSelect.value) : 0;
      if (!rid) {
        showBanner(t("selectRecordFirst"), "error");
        return;
      }
      const row = cachedAllRows.find((r) => Number(r.id) === rid);
      if (!row) {
        showBanner(t("couldNotLoad"), "error");
        return;
      }
      applyRowToForm(row);
      showBanner(t("loadedForEdit"), "success");
      hideBannerSoon();
    });
  }

  const exportDayGoBtn = document.getElementById("export-day-btn");
  if (exportDayGoBtn) {
    exportDayGoBtn.addEventListener("click", () => {
      const sel = document.getElementById("export-day-select");
      const d = sel ? String(sel.value).trim() : "";
      if (!d) {
        showBanner(t("exportPickPeriod"), "error");
        return;
      }
      runExportForPeriod("daily", d).catch(() => showBanner(t("exportFailed"), "error"));
    });
  }

  refreshSubmitLabel();
  updateCalculations();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("date").value.trim();
    const store = document.getElementById("store").value;
    const platform = document.getElementById("platform").value;

    if (!date || !store) {
      showBanner(t("needDateStore"), "error");
      return;
    }

    const payload = {
      market: currentMarket,
      date,
      store,
      platform: platform || "",
      ads_count: Math.round(parseNum("ads_count")),
      platform_sales: Math.round(parseNum("platform_sales")),
      whatsapp_sales: Math.round(parseNum("whatsapp_sales")),
      unknown_sales: Math.round(parseNum("unknown_sales")),
      cost: parseNum("cost"),
      content_cost: parseNum("content_cost"),
      purchase_count: getComputedPurchaseCount(),
      purchase_value: getPurchaseValuesTotal(),
      purchase_values: collectPurchaseValuesArray(),
      whatsapp_clicks: Math.round(parseNum("whatsapp_clicks")),
    };

    submitBtn.disabled = true;

    try {
      const isUpdate = Boolean(editingRecordId);
      const url = isUpdate ? `/update/${editingRecordId}` : "/add";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showBanner(data.error || t("couldNotSave"), "error");
        return;
      }

      if (isUpdate) {
        showBanner(t("updatedSuccess"), "success");
        hideBannerSoon();
        editingRecordId = null;
        refreshSubmitLabel();
        await loadRecords();
        return;
      }

      showBanner(t("savedSuccess"), "success");
      hideBannerSoon();

      const savedDate = date;
      const savedStore = store;
      const savedPlatform = platform;
      const nextPlatform = getNextPlatformForStore(savedStore, savedPlatform);

      clearEntryFieldsForNextPlatform();

      document.getElementById("date").value = savedDate;
      if (storeSelect) storeSelect.value = savedStore;
      refreshPlatformOptions();
      if (platformSelect) platformSelect.value = nextPlatform;
      lastRenderedPurchaseCount = -1;
      editingRecordId = null;
      refreshSubmitLabel();
      updateCalculations();
      await loadRecords();
    } catch (err) {
      showBanner(t("networkError"), "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  function formatMoney(n) {
    if (n == null || Number.isNaN(n)) return "—";
    return Number(n).toFixed(2);
  }

  async function loadRecords() {
    recordsHint.textContent = t("loading");
    recordsWrap.hidden = true;

    try {
      const res = await fetch(`/data?market=${currentMarket}`);
      if (!res.ok) throw new Error("bad status");
      const rows = await res.json();
      cachedAllRows = rows;

      recordsBody.innerHTML = "";
      if (!rows.length) {
        cachedAllRows = [];
        renderExportDaySelect([]);
        recordsHint.textContent = t("noRecords");
        updateCalculations();
        return;
      }

      recordsHint.textContent = i18n[currentLang].recordsCount(rows.length);
      recordsWrap.hidden = false;
      const rowDateIndex = buildStorePlatformDateIndex(rows);

      for (const r of rows) {
        const streakDisp = getStreakDisplay(rowDateIndex, r.store, r.platform, r.date, {});
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" +
          escapeHtml(r.date) +
          "</td><td>" +
          escapeHtml((storeLabels[r.store] && storeLabels[r.store][currentLang]) || r.store) +
          "</td><td>" +
          escapeHtml(getPlatformLabel(r.platform)) +
          "</td><td>" +
          escapeHtml(String(r.ads_count)) +
          "</td><td>" +
          escapeHtml(String(r.platform_sales)) +
          "</td><td>" +
          escapeHtml(String(r.whatsapp_sales)) +
          "</td><td>" +
          escapeHtml(String(r.unknown_sales)) +
          "</td><td>" +
          formatMoney(r.cost) +
          "</td><td>" +
          escapeHtml(String(r.purchase_count || 0)) +
          "</td><td>" +
          formatMoney(r.purchase_value) +
          "</td><td>" +
          escapeHtml(
            Number(r.purchase_count || 0) > 0
              ? (Number(r.cost || 0) / Number(r.purchase_count || 0)).toFixed(2)
              : "—"
          ) +
          "</td><td>" +
          escapeHtml(String(r.whatsapp_clicks)) +
          "</td><td>" +
          escapeHtml(`${streakDisp.marks} (${streakDisp.count})`) +
          "</td><td>" +
          (() => {
            const pv = getRowPurchaseValueTotal(r);
            const c = Number(r.cost || 0);
            return c > 0 ? (pv / c).toFixed(2) : "—";
          })() +
          "</td><td>" +
          "<button class=\"row-delete-btn\" data-id=\"" +
          escapeHtml(String(r.id)) +
          "\">" +
          escapeHtml(t("delete")) +
          "</button>" +
          "</td>";
        recordsBody.appendChild(tr);
      }

      Array.from(recordsBody.querySelectorAll(".row-delete-btn")).forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = Number(btn.getAttribute("data-id"));
          if (!id) return;
          const ok = window.confirm(t("confirmDelete"));
          if (!ok) return;
          btn.disabled = true;
          btn.textContent = t("deleting");
          try {
            const res = await fetch("/delete/" + id, { method: "DELETE" });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || "delete failed");
            }
            showBanner(t("deletedSuccess"), "success");
            hideBannerSoon();
            if (editingRecordId === id) {
              editingRecordId = null;
              refreshSubmitLabel();
            }
            await loadRecords();
          } catch {
            showBanner(t("couldNotDelete"), "error");
            btn.disabled = false;
            btn.textContent = t("delete");
          }
        });
      });
      renderExportDaySelect(rows);
      refreshHistoryRecordOptions();
      updateCalculations();
    } catch {
      cachedAllRows = [];
      renderExportDaySelect([]);
      recordsHint.textContent = t("couldNotLoad");
      updateCalculations();
    }
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function sum(rows, key) {
    return rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
  }

  // Returns {start, end} dates for Mon-Sun week containing the given date
  function getWeekRange(dateStr) {
    const date = parseYMDLocal(dateStr);
    if (!date) return null;

    // Afaq reporting week: Thursday through Wednesday.
    // JavaScript: 0=Sun, 1=Mon, ..., 4=Thu, ..., 6=Sat.
    const day = date.getDay();
    const daysFromThursday = (day - 4 + 7) % 7;
    const thursday = new Date(date);
    thursday.setDate(thursday.getDate() - daysFromThursday);
    const wednesday = new Date(thursday);
    wednesday.setDate(thursday.getDate() + 6);

    return {
      start: formatYMDLocal(thursday),
      end: formatYMDLocal(wednesday)
    };
  }

  // Previous Thursday-Wednesday reporting week.
  function getPreviousWeekRange(dateStr) {
    const range = getWeekRange(dateStr);
    if (!range) return null;
    const thursday = parseYMDLocal(range.start);
    const prevWeekEnd = new Date(thursday);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekStart.getDate() - 6);
    return {
      start: formatYMDLocal(prevWeekStart),
      end: formatYMDLocal(prevWeekEnd)
    };
  }

  function getComparisonArrow(current, previous) {
    if (current === previous) return "=";
    return current > previous ? "🔼" : "🔽";
  }

  function formatWeeklyMetric(label, current, previous, isNumeric = true) {
    const arrow = getComparisonArrow(current, previous);
    const format = (v) => isNumeric ? v.toFixed(2) : String(v);
    return `- ${label} :${format(current)}${arrow} ${format(previous)}`;
  }

  const reportStores = marketStores;

  const reportStoreNames = {
    "micro store": "مايكرو",
    "birq store": "بيرق",
    "alshahens store": "الشاهين",
    "zmord store": "زمرد",
  };

  const reportPlatformNames = {
    "TikTok-projector": "تيك توك",
    "snapchat-projector": "سناب شات",
    "Google-projector": "جوجل",
    "TikTok-tracker": "تيك توك جهاز التتبع",
    "TikTok-viofo": "تيك توك",
    "snapchat-viofo": "سناب شات",
    "google iraq": "جوجل (العراق)",
    "meta iraq": "ميتا (العراق)",
    "meta iraq k30": "ميتا العراق (k30)",
    "meta iraq jc800p": "ميتا العراق (jc800p)",
    "meta uae k30": "ميتا الامارات (k30)",
    "meta uae jc800p": "ميتا الامارات (jc800p)",
    "meta syria k30": "ميتا سوريا (k30)",
    "meta syria jc800p": "ميتا سوريا (jc800p)",
    "Google Shopping": "جوجل شوبينج",
    Google: "جوجل",
    TikTok: "تيك توك",
    Snapchat: "سناب شات",
    Meta: "ميتا",
    karzoun: "كرزون",
  };

  const saudiReportPlatformGroups = {
    "micro store": [
      { title: "بروجيكتور", platforms: ["Google-projector", "TikTok-projector", "snapchat-projector"] },
      { title: "داشكام", platforms: ["Google", "Google Shopping", "TikTok", "Snapchat", "Meta", "karzoun"] },
    ],
    "birq store": [
      {
        platforms: [
          "Google Shopping",
          "Google",
          "TikTok",
          "Snapchat",
          "Meta",
          "karzoun",
        ],
      },
    ],
    "alshahens store": [
      { platforms: ["Google", "Google Shopping", "TikTok", "TikTok-tracker", "Snapchat", "Meta", "karzoun"] },
    ],
    "zmord store": [
      { platforms: ["Google", "Google Shopping", "TikTok", "Snapchat", "Meta", "karzoun"] },
    ],
  };
  const internationalReportPlatformGroups = {
    "birq store": [
      { title: "سوريا", platforms: ["Syria-Meta"] },
      {
        title: "العراق",
        platforms: [
          "Iraq-Meta-S20", "Iraq-Meta-P10", "Iraq-Meta-K30",
          "Iraq-TikTok-S20", "Iraq-TikTok-P10", "Iraq-TikTok-K30",
        ],
      },
      { title: "لبنان", platforms: ["Lebanon-Meta-S20", "Lebanon-Meta-P10"] },
    ],
    "alshahens store": [
      { title: "قطر", platforms: ["Qatar-Google", "Qatar-TikTok", "Qatar-Snapchat", "Qatar-Meta"] },
      {
        title: "الكويت",
        platforms: [
          "Kuwait-Google", "Kuwait-TikTok", "Kuwait-TikTok-tracker",
          "Kuwait-Snapchat", "Kuwait-Meta",
        ],
      },
      { title: "الأردن", platforms: ["Jordan-Google", "Jordan-TikTok", "Jordan-Snapchat", "Jordan-Meta"] },
      { title: "عمان", platforms: ["Oman-Google", "Oman-TikTok", "Oman-Snapchat", "Oman-Meta"] },
      { title: "مصر", platforms: ["Egypt-Google", "Egypt-TikTok", "Egypt-Snapchat", "Egypt-Meta"] },
      { title: "سوريا", platforms: ["Syria-Meta"] },
    ],
  };
  const reportPlatformGroups =
    currentMarket === "international"
      ? internationalReportPlatformGroups
      : saudiReportPlatformGroups;

  function reportStoreName(store) {
    return reportStoreNames[store] || ((storeLabels[store] && storeLabels[store].ar) || store);
  }

  function reportPlatformName(platform) {
    return reportPlatformNames[platform] || getPlatformLabel(platform, "ar");
  }

  function reportPlatformHeading(platform) {
    return platform === "karzoun" ? "حملة كرزون" : `منصة ${reportPlatformName(platform)}`;
  }

  function isWhatsappClicksPlatform(platform) {
    const p = String(platform || "").toLowerCase();
    return p.includes("google") || p.includes("meta");
  }

  function reportNumber(n, decimals = 2) {
    const value = Number(n || 0);
    if (!Number.isFinite(value)) return "0";
    if (Math.abs(value - Math.round(value)) < 1e-6) return String(Math.round(value));
    return value.toFixed(decimals).replace(/\.?0+$/, "");
  }

  function reportDateShort(dateStr) {
    const parts = String(dateStr || "").split("-");
    return parts.length === 3 ? `${Number(parts[2])}/${Number(parts[1])}` : dateStr;
  }

  function rowsForRange(allRows, store, platform, startDate, endDate) {
    return allRows.filter((r) =>
      r.store === store &&
      r.platform === platform &&
      r.date >= startDate &&
      r.date <= endDate
    );
  }

  function reportStats(rows) {
    const cost = sum(rows, "cost");
    const ads = sum(rows, "ads_count");
    const platformSales = sum(rows, "platform_sales");
    const whatsappSales = sum(rows, "whatsapp_sales");
    const unknownSales = sum(rows, "unknown_sales");
    const count = platformSales + whatsappSales;
    const savedCount = sum(rows, "purchase_count");
    const purchaseCount = count || savedCount;
    const clicks = sum(rows, "whatsapp_clicks");
    const value = rows.reduce((acc, row) => acc + getRowPurchaseValueTotal(row), 0);
    const cpp = purchaseCount > 0 ? cost / purchaseCount : cost;
    const roas = cost > 0 ? value / cost : 0;
    return { cost, ads, platformSales, whatsappSales, unknownSales, purchaseCount, clicks, value, cpp, roas };
  }

  function compareText(current, previous, decimals = 2) {
    const c = Number(current || 0);
    const p = Number(previous || 0);
    const marker = c === p ? "=" : c > p ? "🔼" : "🔽";
    return `${reportNumber(c, decimals)}${marker} ${reportNumber(p, decimals)}`;
  }

  function selectedReportStores(selectedStore) {
    return selectedStore ? [selectedStore] : reportStores;
  }

  const monthlyNoReplyRates = {
    "micro store": 45,
    "birq store": 55,
    "alshahens store": 65,
    "zmord store": 50,
  };

  function optionNumber(options, key, fallback = 0) {
    if (!options || options[key] == null || options[key] === "") return fallback;
    const value = Number(options[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  function parseSupplementNumber(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const value = Number(String(el.value || "").replace(",", "."));
    return Number.isFinite(value) ? value : 0;
  }

  function extractLabeledArabicNumber(text, labels) {
    const source = String(text || "");
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = source.match(new RegExp(`${escaped}\\s*[:：]?\\s*(\\d+(?:[.,]\\d+)?)`, "i"));
      if (match) return Number(match[1].replace(",", "."));
    }
    return 0;
  }

  function normArabicHeader(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/[إأآ]/g, "ا")
      .replace(/ة/g, "ه")
      .toLowerCase();
  }

  function parseExcelPasteTable(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.split("\t").map((cell) => cell.trim()))
      .filter((row) => row.some(Boolean));
    if (lines.length < 3) return null;

    const sectionRow = lines[0].map(normArabicHeader);
    const labelRow = lines[1].map(normArabicHeader);
    const waTotals = { google: 0, referral: 0, tiktok: 0, snapchat: 0, instagram: 0, youtube: 0 };
    const siteTotals = { google: 0, referral: 0, tiktok: 0, snapchat: 0, instagram: 0, youtube: 0 };
    let repliedCol = -1;
    let noReplyCol = -1;
    let totalCol = -1;
    const labelMap = {
      جوجل: "google",
      توصيه: "referral",
      تيكتوك: "tiktok",
      سنابشات: "snapchat",
      انستا: "instagram",
      ميتا: "instagram",
      يوتيوب: "youtube",
    };

    function sectionForColumn(col) {
      for (let i = col; i >= 0; i -= 1) {
        if (sectionRow[i].includes("واتس")) return "wa";
        if (sectionRow[i].includes("منص") || sectionRow[i].includes("موقع")) return "site";
      }
      return "";
    }

    sectionRow.forEach((label, col) => {
      if (label.includes("اجماليالرد")) repliedCol = col;
      if (label.includes("اجماليعدم") || label.includes("لميرد")) noReplyCol = col;
      if (label.includes("اجماليالمبيعات")) totalCol = col;
    });

    const summaryRow = [...lines].reverse().find((row) => {
      if (String(row[0] || "").trim()) return false;
      return row.slice(1).some((cell) =>
        Number.isFinite(Number(String(cell || "").replace(",", ".")))
      );
    });

    labelRow.forEach((label, col) => {
      const key = labelMap[label];
      const section = sectionForColumn(col);
      if (!key || !section) return;
      const summaryValue = summaryRow
        ? Number(String(summaryRow[col] || "").replace(",", "."))
        : NaN;
      let total = Number.isFinite(summaryValue) ? summaryValue : 0;
      if (!Number.isFinite(summaryValue)) {
        for (let rowIdx = 2; rowIdx < lines.length; rowIdx += 1) {
          if (lines[rowIdx] === summaryRow) continue;
          const value = Number(String(lines[rowIdx][col] || "").replace(",", "."));
          if (Number.isFinite(value)) total += value;
        }
      }
      if (section === "wa") waTotals[key] += total;
      if (section === "site") siteTotals[key] += total;
    });

    const totalWhatsapp = Object.values(waTotals).reduce((a, b) => a + b, 0);
    const totalWebsite = Object.values(siteTotals).reduce((a, b) => a + b, 0);
    let replied = 0;
    let noReply = 0;
    let grandTotal = 0;
    const lastDataRow = summaryRow || lines[lines.length - 1] || [];
    if (repliedCol >= 0) replied = Number(String(lastDataRow[repliedCol] || "").replace(",", ".")) || 0;
    if (noReplyCol >= 0) noReply = Number(String(lastDataRow[noReplyCol] || "").replace(",", ".")) || 0;
    if (totalCol >= 0) grandTotal = Number(String(lastDataRow[totalCol] || "").replace(",", ".")) || 0;
    if (!replied) replied = totalWhatsapp + totalWebsite;
    if (!grandTotal) grandTotal = replied + noReply;
    if (!totalWhatsapp && !totalWebsite && !replied && !noReply) return null;
    return { waTotals, siteTotals, totalWhatsapp, totalWebsite, replied, noReply, grandTotal };
  }

  function parseMonthlyPasteStats(text) {
    const table = parseExcelPasteTable(text);
    if (table) {
      return {
        replied: table.replied,
        noReply: table.noReply,
        grandTotal: table.grandTotal,
        totalWhatsapp: table.totalWhatsapp,
        totalWebsite: table.totalWebsite,
        waTotals: table.waTotals,
        siteTotals: table.siteTotals,
        raw: "",
        fromTable: true,
      };
    }
    return {
      replied: extractLabeledArabicNumber(text, ["رد", "-رد"]),
      noReply: extractLabeledArabicNumber(text, ["لم يرد", "-لم يرد"]),
      grandTotal: extractLabeledArabicNumber(text, ["اجمالي المبيعات", "إجمالي المبيعات"]),
      totalWhatsapp: extractLabeledArabicNumber(text, ["اجمالي الواتس", "إجمالي الواتس"]),
      totalWebsite: extractLabeledArabicNumber(text, ["اجمالي الموقع", "إجمالي الموقع"]),
      waTotals: null,
      siteTotals: null,
      raw: String(text || "").trim(),
      fromTable: false,
    };
  }

  function monthlySalesBlock(store, stats) {
    if (!stats || !stats.fromTable) return stats && stats.raw ? stats.raw : "";
    const wa = stats.waTotals || {};
    const site = stats.siteTotals || {};
    const totalSales = stats.grandTotal || stats.totalWhatsapp + stats.totalWebsite + Number(stats.noReply || 0);
    return [
      `▪︎مبيعات متجر ${reportStoreName(store)}▪︎`,
      "",
      "•مبيعات بالواتس•",
      `اجمالي الواتس ${reportNumber(stats.totalWhatsapp, 0)}`,
      `- جوجل ${reportNumber(wa.google, 0)}`,
      `- توصيه ${reportNumber(wa.referral, 0)}`,
      `- تيك توك ${reportNumber(wa.tiktok, 0)}`,
      `- سناب ${reportNumber(wa.snapchat, 0)}`,
      `- ميتا : ${reportNumber(wa.instagram, 0)}`,
      `- يوتيوب : ${reportNumber(wa.youtube, 0)}`,
      "",
      "•مبيعات الموقع•",
      `اجمالي الموقع ${reportNumber(stats.totalWebsite, 0)}`,
      `- جوجل :${reportNumber(site.google, 0)}`,
      `- توصيه ${reportNumber(site.referral, 0)}`,
      `- تيك توك ${reportNumber(site.tiktok, 0)}`,
      `- سناب ${reportNumber(site.snapchat, 0)}`,
      `- ميتا ${reportNumber(site.instagram, 0)}`,
      `- يوتيوب ${reportNumber(site.youtube, 0)}`,
      "",
      `-رد: ${reportNumber(stats.replied || stats.totalWhatsapp + stats.totalWebsite, 0)}`,
      `-لم يرد: ${reportNumber(stats.noReply, 0)}`,
      `-اجمالي المبيعات:${reportNumber(totalSales, 0)}`,
    ].join("\n");
  }

  function monthlySocialNoReply(store, pasteStats) {
    const rate = monthlyNoReplyRates[store] || 50;
    return Math.round((Number(pasteStats.noReply || 0) * rate) / 100);
  }

  function storeReportGroups(store) {
    return reportPlatformGroups[store] || [{ platforms: platformMapByStore[store] || [] }];
  }

  function reportGroupHeading(title) {
    return "\u25aa\ufe0e" + title + "\u25aa\ufe0e";
  }

  
function buildWeeklyReport(allRows, selectedStore, periodValue, options = {}) {
    let anchorDateStr;
    if (periodValue && periodValue.includes("-W")) {
      const parts = periodValue.split("-W").map(Number);
      const yr = parts[0];
      const wk = parts[1];
      const jan4 = new Date(yr, 0, 4);
      const jan4Day = jan4.getDay() === 0 ? 7 : jan4.getDay();
      const isoMonday = new Date(jan4);
      isoMonday.setDate(jan4.getDate() - (jan4Day - 1) + (wk - 1) * 7);
      anchorDateStr = formatYMDLocal(isoMonday);
    } else if (periodValue) {
      anchorDateStr = periodValue;
    } else {
      anchorDateStr = formatYMDLocal(new Date());
    }

    const weekRange = getWeekRange(anchorDateStr);
    const prevWeekRange = getPreviousWeekRange(anchorDateStr);
    const lines = [];
    const stores = selectedReportStores(selectedStore);

    stores.forEach((store, storeIdx) => {
      const storeName = reportStoreName(store);
      lines.push("\u25a0\u062a\u0642\u0631\u064a\u0631 \u0627\u0633\u0628\u0648\u0639\u064a \u0644\u0645\u062a\u062c\u0631 (" + storeName + ")");
      lines.push(reportDateShort(weekRange.start) + " - " + reportDateShort(weekRange.end));
      lines.push("\u25a1\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u0627\u0639\u0644\u0627\u0646\u0627\u062a");

      storeReportGroups(store).forEach((group) => {
        const groupHasRows = group.platforms.some((platform) =>
          rowsForRange(allRows, store, platform, prevWeekRange.start, weekRange.end).length
        );
        if (!groupHasRows) return;
        if (group.title) {
          lines.push("");
          lines.push(reportGroupHeading(group.title));
        }
        group.platforms.forEach((platform) => {
          const currentRows = rowsForRange(allRows, store, platform, weekRange.start, weekRange.end);
          const prevRows = rowsForRange(allRows, store, platform, prevWeekRange.start, prevWeekRange.end);
          if (!currentRows.length && !prevRows.length) return;

          const current = reportStats(currentRows);
          const previous = reportStats(prevRows);
          lines.push("");
          lines.push("\u25cb" + reportPlatformHeading(platform));
          lines.push("- \u0627\u0644\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0643\u0644\u064a\u0629 :" + compareText(current.cost, previous.cost));
          lines.push("- \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0628\u064a\u0639 :" + compareText(current.cpp, previous.cpp));
          lines.push("- \u0639\u062f\u062f \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a :" + compareText(current.purchaseCount, previous.purchaseCount, 0));

          if (platform !== "karzoun") {
            lines.push("- \u0645\u0646\u0635\u0629: " + compareText(current.platformSales, previous.platformSales, 0));
            lines.push("- \u0648\u0627\u062a\u0633:" + compareText(current.whatsappSales, previous.whatsappSales, 0));
          }

          if (current.clicks > 0 || previous.clicks > 0 || isWhatsappClicksPlatform(platform)) {
            lines.push("- \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a :" + compareText(current.clicks, previous.clicks, 0));
          }

          lines.push("- \u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0628\u064a\u0639: " + compareText(current.roas, previous.roas));
        });
      });

      const currentStoreRows = allRows.filter((r) => r.store === store && r.date >= weekRange.start && r.date <= weekRange.end);
      const previousStoreRows = allRows.filter((r) => r.store === store && r.date >= prevWeekRange.start && r.date <= prevWeekRange.end);
      const currentSummary = reportStats(currentStoreRows);
      const previousSummary = reportStats(previousStoreRows);
      const contentRows = currentStoreRows.filter((r) => Number(r.content_cost || 0) > 0);
      const contentCost = optionNumber(options, "contentCost", sum(contentRows, "content_cost"));
      const contentCount = optionNumber(options, "contentCount", contentRows.length);
      const noReply = optionNumber(options, "unansweredPurchases", 0);
      const prevNoReply = optionNumber(options, "previousUnansweredPurchases", 0);
      const totalPurchases = currentSummary.purchaseCount + noReply;
      const prevTotalPurchases = previousSummary.purchaseCount + prevNoReply;
      const totalCpp = totalPurchases > 0 ? currentSummary.cost / totalPurchases : currentSummary.cost;
      const prevTotalCpp = prevTotalPurchases > 0 ? previousSummary.cost / prevTotalPurchases : previousSummary.cost;

      lines.push("");
      lines.push("\u25cf\u062a\u0643\u0627\u0644\u064a\u0641 \u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 (" + storeName + ")\u25cf");
      lines.push("");
      lines.push("- \u0627\u0644\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0643\u0644\u064a\u0629  : " + reportNumber(contentCost));
      lines.push("- \u0639\u062f\u062f \u0627\u0644\u0645\u0642\u0627\u0637\u0639  : " + reportNumber(contentCount, 0));
      lines.push("");
      lines.push(".....................................................");
      lines.push("");
      lines.push("- \u0639\u062f\u062f \u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0627\u0639\u0644\u0627\u0646\u0627\u062a : " + compareText(currentSummary.purchaseCount, previousSummary.purchaseCount, 0));
      lines.push("- \u062a\u0643\u0644\u0641\u0629 \u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0639\u0644\u0627\u0646\u0627\u062a:" + compareText(currentSummary.cost, previousSummary.cost));
      lines.push("- \u0645\u062a\u0648\u0633\u0637 \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0631\u0627\u0621:" + compareText(currentSummary.cpp, previousSummary.cpp));
      lines.push("- \u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0628\u064a\u0639: " + compareText(currentSummary.roas, previousSummary.roas));
      lines.push("- \u0639\u062f\u062f \u0645\u0628\u064a\u0639\u0627\u062a (\u0639\u062f\u0645 \u0627\u0644\u0631\u062f) :" + compareText(noReply, prevNoReply, 0));
      lines.push("- \u0639\u062f\u062f \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0627\u062c\u0645\u0627\u0644\u064a:" + compareText(totalPurchases, prevTotalPurchases, 0));
      lines.push("- \u0645\u062a\u0648\u0633\u0637 \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0627\u062c\u0645\u0627\u0644\u064a:" + compareText(totalCpp, prevTotalCpp));

      if (storeIdx < stores.length - 1) {
        lines.push("");
        lines.push("=".repeat(50));
        lines.push("");
      }
    });

    return lines.join("\n").trim() + "\n";
  }

  
function buildDailyReport(allRows, selectedStore, dateStr) {
    const stores = selectedReportStores(selectedStore);
    const rowIndex = buildStorePlatformDateIndex(allRows);
    const lines = [];

    lines.push("\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u0627\u0639\u0644\u0627\u0646\u0627\u062a.                                      " + reportDateShort(dateStr));

    stores.forEach((store, storeIdx) => {
      const storeName = reportStoreName(store);
      const storeRows = allRows.filter((r) => r.store === store && r.date === dateStr);
      lines.push("");
      lines.push("\u25cf\u0645\u062a\u062c\u0631 " + storeName);
      lines.push("");

      storeReportGroups(store).forEach((group) => {
        const groupHasRows = group.platforms.some((platform) => storeRows.some((r) => r.platform === platform));
        if (!groupHasRows) return;
        if (group.title) {
          lines.push(reportGroupHeading(group.title));
          lines.push("");
        }

        group.platforms.forEach((platform) => {
          const rows = storeRows.filter((r) => r.platform === platform);
          if (!rows.length) return;

          const stats = reportStats(rows);
          const streakDisp = getStreakDisplay(rowIndex, store, platform, dateStr, {});
          const label = platform === "karzoun" ? "\u0643\u0631\u0632\u0648\u0646" : reportPlatformName(platform);
          lines.push(("-" + label + " " + streakDisp.marks).trimEnd());

          if (platform !== "karzoun") {
            lines.push("- \u0639\u062f\u062f \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a " + reportNumber(stats.ads, 0));
          }

          lines.push("- \u0639\u062f\u062f \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a: " + reportNumber(stats.purchaseCount, 0));
          lines.push("- \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(stats.cpp));
          lines.push("- \u0627\u0644\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0643\u0644\u064a\u0629: " + reportNumber(stats.cost));

          if (stats.clicks > 0 || isWhatsappClicksPlatform(platform)) {
            lines.push("- \u0646\u0642\u0631\u0627\u062a \u0627\u0644\u0648\u0627\u062a\u0633: " + reportNumber(stats.clicks, 0));
          }

          lines.push("- \u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(stats.roas));
          const purchaseValues = flattenPurchaseValuesForExport(rows);
          if (purchaseValues.length) {
            purchaseValues.forEach((value) => {
              lines.push("- \u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0628\u064a\u0639: " + formatPurchaseExportValue(value));
            });
          } else {
            lines.push("- \u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0628\u064a\u0639: 0");
          }

          lines.push("");
        });
      });

      if (storeIdx < stores.length - 1) {
        lines.push("----------------------");
      }
    });

    return lines.join("\n").trim() + "\n";
  }

  function buildDailySummaryReport(allRows, selectedStore, startDate, endDate) {
    const stores = selectedReportStores(selectedStore);
    const lines = [];

    lines.push(
      "\u25cf\u062a\u0642\u0631\u064a\u0631 \u0645\u0644\u062e\u0635 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0644\u0644\u0641\u062a\u0631\u0629 \u0645\u0646 " +
      reportDateShort(startDate) +
      " \u0625\u0644\u0649 " +
      reportDateShort(endDate) +
      "\u25cf"
    );

    stores.forEach((store, storeIdx) => {
      const storeRows = allRows.filter(
        (row) => row.store === store && row.date >= startDate && row.date <= endDate
      );
      if (!storeRows.length) return;

      const storeName = reportStoreName(store);
      lines.push("");
      lines.push("\u25cf\u0645\u062a\u062c\u0631 " + storeName);
      lines.push("");

      storeReportGroups(store).forEach((group) => {
        const groupHasRows = group.platforms.some((platform) =>
          storeRows.some((row) => row.platform === platform)
        );
        if (!groupHasRows) return;

        if (group.title) {
          lines.push(reportGroupHeading(group.title));
          lines.push("");
        }

        group.platforms.forEach((platform) => {
          const rows = storeRows.filter((row) => row.platform === platform);
          if (!rows.length) return;

          const stats = reportStats(rows);
          const label = platform === "karzoun" ? "\u0643\u0631\u0632\u0648\u0646" : reportPlatformName(platform);
          lines.push("- " + label);

          if (platform !== "karzoun") {
            lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0639\u062f\u062f \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a: " + reportNumber(stats.ads, 0));
          }

          lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0639\u062f\u062f \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a: " + reportNumber(stats.purchaseCount, 0));
          lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a: " + reportNumber(stats.value));
          lines.push("- \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(stats.cpp));
          lines.push("- \u0627\u0644\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0643\u0644\u064a\u0629: " + reportNumber(stats.cost));

          if (stats.clicks > 0 || isWhatsappClicksPlatform(platform)) {
            lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0646\u0642\u0631\u0627\u062a \u0627\u0644\u0648\u0627\u062a\u0633: " + reportNumber(stats.clicks, 0));
          }

          lines.push("- \u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(stats.roas));
          lines.push("");
        });
      });

      const summary = reportStats(storeRows);
      lines.push("\u25cf\u0645\u0644\u062e\u0635 \u0645\u062a\u062c\u0631 " + storeName + "\u25cf");
      lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0639\u062f\u062f \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a: " + reportNumber(summary.ads, 0));
      lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0639\u062f\u062f \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a: " + reportNumber(summary.purchaseCount, 0));
      lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a: " + reportNumber(summary.value));
      lines.push("- \u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u062a\u0643\u0644\u0641\u0629: " + reportNumber(summary.cost));
      lines.push("- \u0645\u062a\u0648\u0633\u0637 \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0631\u0627\u0621: " + reportNumber(summary.cpp));
      lines.push("- \u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(summary.roas));

      if (storeIdx < stores.length - 1) {
        lines.push("");
        lines.push("----------------------");
      }
    });

    return lines.join("\n").trim() + "\n";
  }

  
  function buildMonthlyReport(allRows, selectedStore, monthValue, options = {}) {
    const stores = selectedReportStores(selectedStore);
    const lines = [];
    const parts = monthValue.split("-").map(Number);
    const year = parts[0];
    const month = parts[1];
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const startDate = formatYMDLocal(monthStart);
    const endDate = formatYMDLocal(monthEnd);

    stores.forEach((store, storeIdx) => {
      const storeName = reportStoreName(store);
      const storeRows = allRows.filter((r) => r.store === store && r.date >= startDate && r.date <= endDate);
      lines.push("\u25a0\u062a\u0642\u0631\u064a\u0631 \u0634\u0647\u0631 " + month + " \u0644\u0645\u062a\u062c\u0631 (" + storeName + ")");
      lines.push("\u25a1\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u0627\u0639\u0644\u0627\u0646\u0627\u062a");
      lines.push("");

      storeReportGroups(store).forEach((group) => {
        const groupHasRows = group.platforms.some((platform) =>
          storeRows.some((row) => row.platform === platform)
        );
        if (!groupHasRows) return;
        if (group.title) {
          lines.push(reportGroupHeading(group.title));
          lines.push("");
        }
        group.platforms.forEach((platform) => {
          const rows = storeRows.filter((r) => r.platform === platform);
          if (!rows.length) return;

          const stats = reportStats(rows);
          lines.push("\u25cb" + reportPlatformHeading(platform));
          lines.push("- \u0627\u0644\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0643\u0644\u064a\u0629: " + reportNumber(stats.cost));
          lines.push("- \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(stats.cpp));
          lines.push("- \u0639\u062f\u062f \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a: " + reportNumber(stats.purchaseCount, 0));

          if (platform !== "karzoun") {
            lines.push("- \u0645\u0646\u0635\u0629: " + reportNumber(stats.platformSales, 0));
            lines.push("- \u0648\u0627\u062a\u0633: " + reportNumber(stats.whatsappSales, 0));
          }

          if (stats.clicks > 0 || isWhatsappClicksPlatform(platform)) {
            lines.push("- \u0646\u0642\u0631\u0627\u062a \u0627\u0644\u0648\u0627\u062a\u0633: " + reportNumber(stats.clicks, 0));
          }

          lines.push("- \u0645\u0639\u062f\u0644 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(stats.roas));
          lines.push("");
        });
      });

      const contentRows = storeRows.filter((r) => Number(r.content_cost || 0) > 0);
      const summary = reportStats(storeRows);
      const contentCost = optionNumber(options, "contentCost", sum(contentRows, "content_cost"));
      const contentCount = optionNumber(options, "contentCount", contentRows.length);
      const seoPurchases = optionNumber(options, "seoPurchases", 0);
      const seoCost = optionNumber(options, "seoCost", 0);
      const seoCpp = seoPurchases > 0 ? seoCost / seoPurchases : 0;
      const pasteStats = parseMonthlyPasteStats(options.pasteText || "");
      const socialNoReply = monthlySocialNoReply(store, pasteStats);
      const totalWithNoReply = summary.purchaseCount + socialNoReply;
      lines.push("\u25cb\u062c\u0648\u062c\u0644 SEO");
      lines.push("-\u0627\u0644\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0643\u0644\u064a\u0629 : " + reportNumber(seoCost));
      lines.push("-\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0645\u0628\u064a\u0639: " + reportNumber(seoCpp));
      lines.push("-\u0639\u062f\u062f \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a " + reportNumber(seoPurchases, 0));
      lines.push("");
      lines.push("\u25cb\u062a\u0643\u0627\u0644\u064a\u0641 \u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649:");
      lines.push("- \u0639\u062f\u062f \u0627\u0644\u0645\u0642\u0627\u0637\u0639: " + reportNumber(contentCount, 0));
      lines.push("- \u0627\u0644\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0643\u0644\u064a\u0629: " + reportNumber(contentCost));
      lines.push("");
      lines.push("\u25cb\u0645\u062a\u0648\u0633\u0637 \u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0631\u0627\u0621: " + reportNumber(summary.cpp));
      lines.push("\u25cb\u062a\u0643\u0644\u0641\u0629 \u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0639\u0644\u0627\u0646\u0627\u062a: " + reportNumber(summary.cost));
      lines.push("\u25cb\u0627\u062c\u0645\u0627\u0644\u0649 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a : " + reportNumber(summary.purchaseCount, 0) + " + " + reportNumber(socialNoReply, 0) + "=" + reportNumber(totalWithNoReply, 0));
      lines.push("\u25cb\u0627\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627(\u0644\u0645 \u064a\u0631\u062f) " + reportNumber(monthlyNoReplyRates[store] || 50, 0) + "%=" + reportNumber(socialNoReply, 0));

      const salesBlock = monthlySalesBlock(store, pasteStats);
      if (salesBlock) {
        lines.push("");
        lines.push("\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf");
        lines.push(salesBlock);
      }

      if (storeIdx < stores.length - 1) {
        lines.push("\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf\u25cf");
        lines.push("");
      }
    });

    return lines.join("\n").trim() + "\n";
  }

  function isSameDateRange(startDate, endDate) {
    return !endDate || startDate === endDate;
  }

  function normalizeExportRange(startDate, endDate) {
    const start = String(startDate || "").trim();
    const end = String(endDate || "").trim() || start;
    return start <= end ? { start, end } : { start: end, end: start };
  }

  function dateRangeDays(startDate, endDate) {
    const out = [];
    let current = parseYMDLocal(startDate);
    const end = parseYMDLocal(endDate);
    if (!current || !end) return out;
    while (current <= end) {
      out.push(formatYMDLocal(current));
      current = addDaysLocal(current, 1);
    }
    return out;
  }

  function weekAnchorsForRange(startDate, endDate) {
    const seen = new Set();
    const anchors = [];
    dateRangeDays(startDate, endDate).forEach((dateStr) => {
      const range = getWeekRange(dateStr);
      if (!range || seen.has(range.start)) return;
      seen.add(range.start);
      anchors.push(range.start);
    });
    return anchors;
  }

  function monthAnchorsForRange(startDate, endDate) {
    const seen = new Set();
    const anchors = [];
    dateRangeDays(startDate, endDate).forEach((dateStr) => {
      const month = dateStr.slice(0, 7);
      if (seen.has(month)) return;
      seen.add(month);
      anchors.push(month);
    });
    return anchors;
  }

  function buildExportContent(type, allRows, selectedStore, startDate, endDate, supplement = {}) {
    if (type === "daily") {
      return isSameDateRange(startDate, endDate)
        ? buildDailyReport(allRows, selectedStore, startDate)
        : buildDailySummaryReport(allRows, selectedStore, startDate, endDate);
    }

    if (type === "weekly") {
      return weekAnchorsForRange(startDate, endDate)
        .map((dateStr) => buildWeeklyReport(allRows, selectedStore, dateStr, supplement).trim())
        .join("\n\n==============================\n\n") + "\n";
    }

    if (type === "monthly") {
      return monthAnchorsForRange(startDate, endDate)
        .map((monthValue) => buildMonthlyReport(allRows, selectedStore, monthValue, supplement).trim())
        .join("\n\n==============================\n\n") + "\n";
    }

    throw new Error("Unsupported report type");
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function setSupplementMode(type) {
    const isWeekly = type === "weekly";
    const isMonthly = type === "monthly";
    if (supplementTitle) supplementTitle.textContent = isWeekly ? "Weekly additions" : "Monthly additions";
    if (supplementSubtitle) {
      supplementSubtitle.textContent = isWeekly
        ? "Fill content cost and no-reply sales before exporting."
        : "Fill content cost, SEO cost and purchases, then paste the monthly Excel range.";
    }
    if (supplementPasteBlock) supplementPasteBlock.hidden = !isMonthly;
    Array.from(document.querySelectorAll(".supplement-weekly-field")).forEach((el) => {
      el.hidden = !isWeekly;
    });
    Array.from(document.querySelectorAll(".supplement-monthly-field")).forEach((el) => {
      el.hidden = !isMonthly;
    });
    setText("supplement-content-count-label", "عدد المقاطع");
    setText("supplement-content-cost-label", "تكاليف صناعة المحتوى");
    setText("supplement-unanswered-label", "عدد مبيعات لم يرد");
    setText("supplement-prev-unanswered-label", "عدد مبيعات لم يرد للأسبوع السابق");
    setText("supplement-seo-purchases-label", "مبيعات SEO");
    setText("supplement-seo-cost-label", "تكلفة SEO");
    setText("supplement-paste-label", "Excel paste");
    if (supplementPreview) {
      supplementPreview.textContent = isMonthly
        ? "Paste the monthly WhatsApp/site sales block here."
        : "Leave fields empty to use 0 for the added weekly values.";
    }
  }

  function getSupplementValues(type) {
    return {
      contentCount: parseSupplementNumber("supplement-content-count"),
      contentCost: parseSupplementNumber("supplement-content-cost"),
      unansweredPurchases: type === "weekly" ? parseSupplementNumber("supplement-unanswered") : 0,
      previousUnansweredPurchases:
        type === "weekly" ? parseSupplementNumber("supplement-prev-unanswered") : 0,
      seoPurchases: type === "monthly" ? parseSupplementNumber("supplement-seo-purchases") : 0,
      seoCost: type === "monthly" ? parseSupplementNumber("supplement-seo-cost") : 0,
      pasteText: type === "monthly" && supplementPaste ? supplementPaste.value : "",
    };
  }

  function requestSupplementValues(type) {
    if (type !== "weekly" && type !== "monthly") return Promise.resolve({});
    if (!supplementModal) return Promise.resolve({});
    setSupplementMode(type);
    supplementModal.hidden = false;
    if (supplementPaste) supplementPaste.value = "";

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        supplementModal.hidden = true;
        supplementContinue && supplementContinue.removeEventListener("click", onContinue);
        supplementSkip && supplementSkip.removeEventListener("click", onSkip);
        supplementCancel && supplementCancel.removeEventListener("click", onCancel);
      };
      const onContinue = () => {
        const values = getSupplementValues(type);
        cleanup();
        resolve(values);
      };
      const onSkip = () => {
        cleanup();
        resolve({});
      };
      const onCancel = () => {
        cleanup();
        reject(new Error("cancelled"));
      };
      supplementContinue && supplementContinue.addEventListener("click", onContinue);
      supplementSkip && supplementSkip.addEventListener("click", onSkip);
      supplementCancel && supplementCancel.addEventListener("click", onCancel);
    });
  }

  async function runExportForPeriod(type, startDate, endDate, supplement) {
    const selectedStore = exportStoreSelect ? exportStoreSelect.value : "";
    const res = await fetch(`/data?market=${currentMarket}`);
    if (!res.ok) throw new Error("bad status");
    const rowData = await res.json();
    const range = normalizeExportRange(startDate, endDate);
    
    try {
      const storePart = selectedStore ? selectedStore.replace(/\s+/g, "-") : "all-stores";
      const rangePart = isSameDateRange(range.start, range.end) ? range.start : `${range.start}-to-${range.end}`;
      const filename = `${type}-report-${storePart}-${rangePart}.txt`;
      const content = buildExportContent(type, rowData, selectedStore || "", range.start, range.end, supplement || {});
      
      if (!content || !filename) {
        throw new Error("Content or filename is empty");
      }
      
      downloadTextFile(filename, content);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  }

  function getWeekDates(weekValue) {
    // weekValue like "2024-W01"
    const [year, week] = weekValue.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const days = (week - 1) * 7 + (firstDayOfYear.getDay() === 0 ? 0 : 7 - firstDayOfYear.getDay());
    const startDate = new Date(year, 0, 1 + days);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return [startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)];
  }

  function getMonthDates(monthValue) {
    // monthValue like "2024-01"
    const [year, month] = monthValue.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return [startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)];
  }

  function renderExportDaySelect(rows) {
    const wrap = document.getElementById("export-by-day-wrap");
    const sel = document.getElementById("export-day-select");
    if (!wrap || !sel) return;
    sel.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.id = "export-day-placeholder";
    placeholder.textContent = t("selectExportDay");
    sel.appendChild(placeholder);
    if (!rows || !rows.length) {
      wrap.hidden = true;
      return;
    }
    const dates = [...new Set(rows.map((r) => r.date))].sort((a, b) => b.localeCompare(a));
    dates.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      sel.appendChild(opt);
    });
    wrap.hidden = false;
  }

  const dateInput = document.getElementById("date");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener("change", () => setLanguage(langSelect.value));
  }

  if (exportStartDateInput && !exportStartDateInput.value) {
    exportStartDateInput.value = new Date().toISOString().slice(0, 10);
  }

  if (exportEndDateInput && !exportEndDateInput.value) {
    exportEndDateInput.value = "";
  }

  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", async () => {
      if (!window.confirm(t("confirmDeleteAll"))) return;

      deleteAllBtn.disabled = true;
      deleteAllBtn.textContent = t("deleteAllRunning");
      try {
        const res = await fetch(`/delete-all?market=${currentMarket}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "delete all failed");
        editingRecordId = null;
        form.reset();
        showBanner(t("deleteAllSuccess"), "success");
        await loadRecords();
      } catch {
        showBanner(t("deleteAllFailed"), "error");
      } finally {
        deleteAllBtn.disabled = false;
        deleteAllBtn.textContent = t("deleteAllBtn");
        hideBannerSoon();
      }
    });
  }

  if (seedBtn) {
    seedBtn.addEventListener("click", async () => {
      seedBtn.disabled = true;
      seedBtn.textContent = t("seedRunning");
      try {
        const res = await fetch("/seed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ market: currentMarket }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "seed failed");
        showBanner(t("seedSuccess")(data.recordsCreated || 0), "success");
        await loadRecords();
      } catch {
        showBanner(t("seedFailed"), "error");
      } finally {
        seedBtn.disabled = false;
        seedBtn.textContent = t("seedBtn");
        hideBannerSoon();
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      const type = exportTypeSelect ? exportTypeSelect.value : "daily";
      const start = exportStartDateInput ? exportStartDateInput.value.trim() : "";
      const end = exportEndDateInput ? exportEndDateInput.value.trim() : "";
      if (!start) {
        showBanner(t("exportNeedPeriod"), "error");
        return;
      }
      try {
        const supplement = await requestSupplementValues(type);
        await runExportForPeriod(type, start, end || start, supplement);
      } catch {
        showBanner(t("exportFailed"), "error");
      }
    });
  }

  populateMarketStoreOptions();
  setLanguage(currentLang);
})();
