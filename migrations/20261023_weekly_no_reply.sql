CREATE TABLE IF NOT EXISTS weekly_no_reply (
  market TEXT NOT NULL,
  store TEXT NOT NULL,
  week_start TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (market, store, week_start)
);
