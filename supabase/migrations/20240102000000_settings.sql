-- Key-value settings store (used by Strategy Pillars and future modules)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('pillar_goal',     'Restore Designers Guild to sustained profitability and position for a premium exit at 8–10× EBITDA in 24–30 months.'),
  ('pillar_strategy', 'Close the £7–9m EBITDA gap through five interlocked workstreams: trade account recovery, pricing discipline, structural cost reduction, US channel expansion, and investor-ready exit preparation.')
ON CONFLICT (key) DO NOTHING;
