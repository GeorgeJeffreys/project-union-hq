-- ── Fix broken inputs on Merger Base Case + Merger Upside ────────────────────
-- Migration 2 used wrong field names (asp_uplift, gross_margin) that don't
-- match ScenarioInputs — this crashes the ScenarioModeller component.
UPDATE scenarios
SET inputs = (inputs - 'asp_uplift' - 'gross_margin')
  || jsonb_build_object(
       'avg_price_uplift_pct', COALESCE((inputs->>'asp_uplift')::numeric, 0),
       'gross_margin_pct',     COALESCE((inputs->>'gross_margin')::numeric, 57.5),
       'dtc_revenue',          COALESCE((inputs->>'dtc_revenue')::numeric, 0)
     )
WHERE name IN ('Merger Base Case', 'Merger Upside (full synergies)')
  AND inputs ? 'asp_uplift';

-- ── Remove duplicate scenarios (keep earliest per name) ──────────────────────
DELETE FROM scenarios
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM scenarios
  ORDER BY name, created_at ASC
);

-- ── Remove duplicate recommendations (keep earliest per title) ───────────────
-- cashflow rows cascade-delete automatically via ON DELETE CASCADE
DELETE FROM recommendations
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM recommendations
  ORDER BY title, created_at ASC
);

-- ── Remove duplicate options (keep earliest per title) ───────────────────────
DELETE FROM options
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM options
  ORDER BY title, created_at ASC
);

-- ── Remove duplicate tasks (keep earliest per title+lane+week) ───────────────
DELETE FROM tasks
WHERE id NOT IN (
  SELECT DISTINCT ON (title, lane, week) id
  FROM tasks
  ORDER BY title, lane, week, created_at ASC
);
