-- Project Union HQ — Supabase migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tasks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  lane       text        NOT NULL,
  week       int         NOT NULL,
  title      text        NOT NULL,
  type       text        NOT NULL CHECK (type IN ('discussion','analysis','problem','recommendation','done')),
  owner      text,
  notes      text,
  created_at timestamptz DEFAULT now()
);

-- ── Tree nodes ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tree_nodes (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  label       text        NOT NULL,
  value       text,
  parent_id   uuid        REFERENCES tree_nodes(id),
  is_editable bool        DEFAULT false,
  sort_order  int         DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ── Scenarios ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenarios (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text        NOT NULL,
  is_baseline bool        DEFAULT false,
  inputs      jsonb,
  created_at  timestamptz DEFAULT now()
);

-- ── Options ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS options (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  workstream  text        NOT NULL CHECK (workstream IN ('revenue','cost')),
  stage       text        NOT NULL CHECK (stage IN ('could','can','should')),
  title       text        NOT NULL,
  description text,
  impact_low  numeric,
  impact_high numeric,
  cash_cost   numeric,
  tree_node   text,
  rationale   text,
  created_at  timestamptz DEFAULT now()
);

-- ── Recommendations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text        NOT NULL,
  pillar      text,
  tree_node   text,
  impact_low  numeric,
  impact_high numeric,
  approved    bool        DEFAULT false,
  horizons    jsonb,
  created_at  timestamptz DEFAULT now()
);

-- ── Cashflow ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cashflow (
  id       uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  rec_id   uuid    REFERENCES recommendations(id) ON DELETE CASCADE,
  quarter  int     NOT NULL CHECK (quarter BETWEEN 1 AND 8),
  cost_out numeric DEFAULT 0,
  saving_in numeric DEFAULT 0
);

-- ── Chat messages ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  role       text        NOT NULL CHECK (role IN ('user','assistant')),
  content    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════════
-- SEED DATA — Designers Guild · Project Union
-- ════════════════════════════════════════════════════════════════════

-- ── Engagement Calendar tasks ─────────────────────────────────────
INSERT INTO tasks (lane, week, title, type, owner, notes) VALUES
  ('Discovery', 1, 'Kick-off & scope alignment',     'discussion',     'All',        'Align on workstreams, data access, and deliverable dates'),
  ('Discovery', 1, 'Management interviews',           'discussion',     'Lead Partner','CEO, CFO, COO, CMO — 45 min each'),
  ('Discovery', 2, 'P&L and cost base deep-dive',    'analysis',       'Analyst',    'Last 3 years actuals, current year budget vs actuals'),
  ('Discovery', 2, 'Customer & channel data pull',   'analysis',       'Analyst',    'Trade, US wholesale, DTC by SKU and margin'),
  ('Discovery', 3, 'Revenue root-cause analysis',    'problem',        'Manager',    'Volume / price / mix decomposition'),
  ('Discovery', 3, 'Property portfolio review',      'analysis',       'Manager',    'Lease terms, break clauses, utilisation by site'),
  ('Discovery', 4, 'Week 4 client update',           'discussion',     'Lead Partner','Mid-point check — priorities and concerns'),
  ('Revenue',   2, 'Pricing architecture audit',     'analysis',       'Manager',    'ASP by channel, discount policy, competitor benchmarks'),
  ('Revenue',   3, 'Dormant account identification', 'analysis',       'Analyst',    'Accounts with zero orders in 18 months — reactivation potential'),
  ('Revenue',   3, 'US market opportunity sizing',   'analysis',       'Analyst',    'Wholesale vs DTC growth headroom'),
  ('Revenue',   4, 'Contract channel hire case',     'analysis',       'Manager',    'Business case for two senior A&D sales hires'),
  ('Revenue',   5, 'Pricing uplift recommendation',  'recommendation', 'Manager',    'Present 3–8% selective price increase proposal'),
  ('Revenue',   6, 'Channel strategy sign-off',      'discussion',     'Lead Partner','Align on US expansion and DTC investment priorities'),
  ('Cost',      2, 'Latimer Place exit analysis',    'analysis',       'Analyst',    'P&L of Latimer Place showroom; lease break mechanics'),
  ('Cost',      3, 'Headcount structure review',     'analysis',       'Manager',    'Role-by-role comparison vs sector benchmarks'),
  ('Cost',      4, 'EU entity consolidation scoping','analysis',       'Analyst',    'France + Germany legal entity cost vs one-country model'),
  ('Cost',      5, 'Property exit recommendation',   'recommendation', 'Manager',    'Recommend Latimer Place exit in Q2'),
  ('Cost',      6, 'Headcount right-sizing options', 'problem',        'Manager',    'Identify £1.5m headcount reduction options'),
  ('Client',    4, 'Midpoint steering committee',    'discussion',     'Lead Partner','Board + CEO: progress update and directional approval'),
  ('Client',    6, 'Scenario modeller walk-through', 'discussion',     'Lead Partner','Present upside / downside EBITDA scenarios'),
  ('Client',    7, 'Draft recommendations review',   'recommendation', 'Lead Partner','Board pre-read: five priority recommendations'),
  ('Client',    8, 'Final board presentation',       'done',           'Lead Partner','Deliver final strategy report and 2-year plan');

-- ── Diagnostic tree ───────────────────────────────────────────────
-- Root
INSERT INTO tree_nodes (id, label, value, parent_id, is_editable, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'EBITDA', '-£2.0m', NULL, false, 0);

-- Level 1
INSERT INTO tree_nodes (id, label, value, parent_id, is_editable, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Revenue', '£27.0m', '00000000-0000-0000-0000-000000000001', false, 0),
  ('00000000-0000-0000-0000-000000000011', 'Costs',   '£29.0m', '00000000-0000-0000-0000-000000000001', false, 1);

-- Revenue children
INSERT INTO tree_nodes (id, label, value, parent_id, is_editable, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000020', 'Volume',   '£18.9m trade', '00000000-0000-0000-0000-000000000010', true, 0),
  ('00000000-0000-0000-0000-000000000021', 'Price/Mix','ASP £340 | GM 54.4%', '00000000-0000-0000-0000-000000000010', true, 1),
  ('00000000-0000-0000-0000-000000000022', 'Channel',  'Trade 70% | US 20% | DTC 10%', '00000000-0000-0000-0000-000000000010', true, 2);

-- Cost children
INSERT INTO tree_nodes (id, label, value, parent_id, is_editable, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000030', 'COGS',          '45.6% | stable', '00000000-0000-0000-0000-000000000011', true, 0),
  ('00000000-0000-0000-0000-000000000031', 'Property',      '£3.2m | 11.8% rev', '00000000-0000-0000-0000-000000000011', true, 1),
  ('00000000-0000-0000-0000-000000000032', 'Headcount',     '£9.0m | 150 staff | £180k/head', '00000000-0000-0000-0000-000000000011', true, 2),
  ('00000000-0000-0000-0000-000000000033', 'Other overhead','£3.3m', '00000000-0000-0000-0000-000000000011', true, 3);

-- Volume leaf nodes
INSERT INTO tree_nodes (id, label, value, parent_id, is_editable, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000040', 'Active accounts','1,840 | down 12% yoy', '00000000-0000-0000-0000-000000000020', true, 0),
  ('00000000-0000-0000-0000-000000000041', 'Trend',          'Q4 ARR -8% | pipeline flat', '00000000-0000-0000-0000-000000000020', true, 1);

-- Price/Mix leaf nodes
INSERT INTO tree_nodes (id, label, value, parent_id, is_editable, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000042', 'ASP',  '£340 | last raised 2021', '00000000-0000-0000-0000-000000000021', true, 0),
  ('00000000-0000-0000-0000-000000000043', 'GM%',  '54.4% | sector avg 58%', '00000000-0000-0000-0000-000000000021', true, 1);

-- Channel leaf nodes
INSERT INTO tree_nodes (id, label, value, parent_id, is_editable, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000044', 'Trade', '£18.9m | 1,840 accounts', '00000000-0000-0000-0000-000000000022', true, 0),
  ('00000000-0000-0000-0000-000000000045', 'US',    '£5.4m | 12 wholesale partners', '00000000-0000-0000-0000-000000000022', true, 1),
  ('00000000-0000-0000-0000-000000000046', 'DTC',   '£2.7m | web + 2 showrooms', '00000000-0000-0000-0000-000000000022', true, 2);

-- ── Baseline scenario ─────────────────────────────────────────────
INSERT INTO scenarios (id, name, is_baseline, inputs) VALUES (
  '00000000-0000-0000-0000-000000001000',
  'Baseline',
  true,
  '{
    "trade_revenue": 18.9,
    "us_revenue": 5.4,
    "dtc_revenue": 2.7,
    "avg_price_uplift_pct": 0,
    "gross_margin_pct": 54.4,
    "property": 3.2,
    "headcount": 9.0,
    "marketing": 1.19,
    "other_overhead": 3.3
  }'::jsonb
);

INSERT INTO scenarios (id, name, is_baseline, inputs) VALUES (
  '00000000-0000-0000-0000-000000001001',
  'Upside',
  false,
  '{
    "trade_revenue": 19.5,
    "us_revenue": 6.2,
    "dtc_revenue": 3.1,
    "avg_price_uplift_pct": 5,
    "gross_margin_pct": 56.0,
    "property": 2.4,
    "headcount": 7.8,
    "marketing": 1.19,
    "other_overhead": 3.0
  }'::jsonb
);

-- ── Workstream options ────────────────────────────────────────────
INSERT INTO options (workstream, stage, title, description, impact_low, impact_high, cash_cost, tree_node, rationale) VALUES
  ('revenue', 'should', 'Selective price increase (3–8%)',
   'Apply 3–8% price increase across fabric and wallpaper collections, prioritising premium and archive ranges where elasticity analysis shows low sensitivity.',
   1.5, 2.5, 0.1, 'Price/Mix',
   'DG has not raised prices since 2021. Competitor benchmarking shows ASP of £340 is 12–15% below closest luxury peers. Even a 5% blended uplift on the fabric range adds £1.2m revenue at minimal incremental cost.'),
  ('revenue', 'should', 'Dormant account reactivation programme',
   'Target 600+ accounts with zero orders in 18 months. Deploy dedicated inside-sales resource with bespoke collection packs and trade terms incentive.',
   0.8, 1.5, 0.2, 'Volume',
   'Account churn analysis shows 634 previously active trade accounts went dormant in 2022–23. Reactivating just 20% at average spend of £8k returns £1.0m incremental revenue.'),
  ('revenue', 'can', 'US wholesale expansion',
   'Double US partner count from 12 to 24 showrooms; launch US e-commerce fulfilment from existing inventory.',
   1.0, 2.0, 0.5, 'Channel',
   'US luxury interiors market is growing at 8% p.a. DG has brand recognition with A&D community but thin distribution. Two dedicated hires in New York and LA would unlock the pipeline.'),
  ('revenue', 'can', 'Contract channel hire (A&D)',
   'Hire two senior A&D specification sales executives on £80–90k base + commission to target contract interior design projects.',
   1.2, 2.0, 0.3, 'Channel',
   'Contract specification projects (hotels, offices, hospitality) represent a high-value channel DG is currently absent from. Two senior hires targeting £500k+ projects could add £1.5m revenue in year 1.'),
  ('revenue', 'could', 'DTC digital investment',
   'Increase digital marketing spend by £0.5m to drive DTC web traffic; replatform to Shopify Plus for better conversion.',
   0.5, 1.2, 0.8, 'Channel',
   'DTC at 10% of revenue (£2.7m) is low for a luxury brand with strong visual assets. Digital investment should yield 3–4× ROAS based on similar luxury home brands.'),
  ('cost', 'should', 'Latimer Place showroom exit',
   'Exercise lease break clause in Q2 2025. Relocate remaining stock and operations to Design Centre showroom. Estimated saving £0.8m net of exit costs.',
   0.8, 1.2, 0.3, 'Property',
   'Latimer Place generates £0.4m revenue (1.5% of total) but costs £1.1m in rent, rates and fit-out amortisation. Net contribution is deeply negative. The 2025 break clause is a one-time exit opportunity.'),
  ('cost', 'should', 'EU entity consolidation',
   'Merge French and German legal entities into a single EU subsidiary. Reduce local overhead by consolidating finance, HR, and logistics functions.',
   0.5, 0.9, 0.4, 'Headcount',
   'DG operates separate entities in France and Germany with combined local overhead of £1.4m. Single-entity model with centralised EU operations reduces this by 40–60%.'),
  ('cost', 'can', 'Headcount right-sizing',
   'Identify 8–12 role redundancies through restructure of middle-management layer. Natural attrition plus voluntary departures to minimise cost.',
   0.8, 1.4, 0.6, 'Headcount',
   'Headcount cost of £180k/head is 15% above sector benchmark. Management-to-IC ratio of 1:3 is inefficient. Structural redesign targeting 1:4.5 removes £1.0m+ without front-line impact.'),
  ('cost', 'could', 'Logistics & fulfilment renegotiation',
   'Retender warehousing and carrier contracts. Consolidate to two carriers from current four.',
   0.3, 0.6, 0.1, 'Other overhead',
   'Current logistics spend of £1.8m is fragmented across four providers. Market retender with consolidated volume should achieve 15–20% saving (£270–360k).'),
  ('cost', 'could', 'Marketing spend optimisation',
   'Redirect £300k from print catalogue spend to digital channels with measurable attribution.',
   0.2, 0.4, 0.05, 'Other overhead',
   'Print catalogue programme costs £400k p.a. with no trackable attribution. Digital redirect maintains brand presence at lower cost and enables ROI measurement.');

-- ── Recommendations ───────────────────────────────────────────────
INSERT INTO recommendations (id, title, pillar, tree_node, impact_low, impact_high, approved, horizons) VALUES
  ('00000000-0000-0000-0000-000000002001',
   'Latimer Place showroom exit',
   'Cost Efficiency',
   'Property',
   0.8, 1.2, true,
   '{"h0_3": {"actions": "Exercise lease break notice by 31 March 2025. Commission dilapidations survey.", "owner": "CFO"}, "h3_12": {"actions": "Complete exit by 30 June. Dispose of bespoke furniture. Retain one sales associate at Design Centre.", "owner": "COO"}, "h12_24": {"actions": "Review Design Centre showroom performance; consider Clerkenwell consolidation.", "owner": "COO"}}'::jsonb),
  ('00000000-0000-0000-0000-000000002002',
   'Selective pricing policy (3–8%)',
   'Revenue Growth',
   'Price/Mix',
   1.5, 2.5, true,
   '{"h0_3": {"actions": "Complete elasticity analysis by SKU. Draft new price list for SS25 launch.", "owner": "CMO"}, "h3_12": {"actions": "Launch SS25 at new price points. Monitor sell-through and account retention.", "owner": "CMO"}, "h12_24": {"actions": "Review AW25 pricing; extend uplift to wallpaper range.", "owner": "CMO"}}'::jsonb),
  ('00000000-0000-0000-0000-000000002003',
   'Dormant account reactivation',
   'Revenue Growth',
   'Volume',
   0.8, 1.5, true,
   '{"h0_3": {"actions": "Segment 634 dormant accounts by last-order value. Build outreach campaign with bespoke sample packs.", "owner": "Sales Director"}, "h3_12": {"actions": "Run 12-week outreach programme. Target 120 reactivations. Track revenue uplift.", "owner": "Sales Director"}, "h12_24": {"actions": "Embed quarterly account health review into CRM process.", "owner": "Sales Director"}}'::jsonb),
  ('00000000-0000-0000-0000-000000002004',
   'EU entity consolidation',
   'Cost Efficiency',
   'Headcount',
   0.5, 0.9, false,
   '{"h0_3": {"actions": "Appoint legal counsel in France and Germany. Assess TUPE and local employment law risk.", "owner": "CFO"}, "h3_12": {"actions": "File consolidation with local authorities. Migrate payroll and tax filings.", "owner": "CFO"}, "h12_24": {"actions": "Complete entity wind-down. Single EU entity fully operational.", "owner": "CFO"}}'::jsonb),
  ('00000000-0000-0000-0000-000000002005',
   'Contract channel — A&D hire',
   'Revenue Growth',
   'Channel',
   1.2, 2.0, true,
   '{"h0_3": {"actions": "Define role specifications. Engage specialist luxury search firm. Target 90-day hire.", "owner": "CEO"}, "h3_12": {"actions": "Onboard two A&D sales executives. Target 20 project specifications in H2.", "owner": "Sales Director"}, "h12_24": {"actions": "Review pipeline conversion. Hire third if year-1 revenue exceeds £800k.", "owner": "CEO"}}'::jsonb);

-- ── Cashflow for approved recommendations ─────────────────────────
-- Rec 1: Latimer Place exit
-- Cost out in Q1 (legal/exit), savings from Q2 onwards
INSERT INTO cashflow (rec_id, quarter, cost_out, saving_in) VALUES
  ('00000000-0000-0000-0000-000000002001', 1, 0.30, 0.00),
  ('00000000-0000-0000-0000-000000002001', 2, 0.00, 0.20),
  ('00000000-0000-0000-0000-000000002001', 3, 0.00, 0.27),
  ('00000000-0000-0000-0000-000000002001', 4, 0.00, 0.27),
  ('00000000-0000-0000-0000-000000002001', 5, 0.00, 0.27),
  ('00000000-0000-0000-0000-000000002001', 6, 0.00, 0.27),
  ('00000000-0000-0000-0000-000000002001', 7, 0.00, 0.27),
  ('00000000-0000-0000-0000-000000002001', 8, 0.00, 0.27);

-- Rec 2: Pricing policy
-- Small implementation cost in Q1, revenue uplift from Q2
INSERT INTO cashflow (rec_id, quarter, cost_out, saving_in) VALUES
  ('00000000-0000-0000-0000-000000002002', 1, 0.10, 0.00),
  ('00000000-0000-0000-0000-000000002002', 2, 0.00, 0.30),
  ('00000000-0000-0000-0000-000000002002', 3, 0.00, 0.45),
  ('00000000-0000-0000-0000-000000002002', 4, 0.00, 0.45),
  ('00000000-0000-0000-0000-000000002002', 5, 0.00, 0.50),
  ('00000000-0000-0000-0000-000000002002', 6, 0.00, 0.50),
  ('00000000-0000-0000-0000-000000002002', 7, 0.00, 0.55),
  ('00000000-0000-0000-0000-000000002002', 8, 0.00, 0.55);

-- Rec 3: Dormant accounts
INSERT INTO cashflow (rec_id, quarter, cost_out, saving_in) VALUES
  ('00000000-0000-0000-0000-000000002003', 1, 0.20, 0.00),
  ('00000000-0000-0000-0000-000000002003', 2, 0.00, 0.15),
  ('00000000-0000-0000-0000-000000002003', 3, 0.00, 0.28),
  ('00000000-0000-0000-0000-000000002003', 4, 0.00, 0.32),
  ('00000000-0000-0000-0000-000000002003', 5, 0.00, 0.35),
  ('00000000-0000-0000-0000-000000002003', 6, 0.00, 0.35),
  ('00000000-0000-0000-0000-000000002003', 7, 0.00, 0.37),
  ('00000000-0000-0000-0000-000000002003', 8, 0.00, 0.37);

-- Rec 5: A&D hire (approved)
INSERT INTO cashflow (rec_id, quarter, cost_out, saving_in) VALUES
  ('00000000-0000-0000-0000-000000002005', 1, 0.15, 0.00),
  ('00000000-0000-0000-0000-000000002005', 2, 0.15, 0.10),
  ('00000000-0000-0000-0000-000000002005', 3, 0.00, 0.25),
  ('00000000-0000-0000-0000-000000002005', 4, 0.00, 0.35),
  ('00000000-0000-0000-0000-000000002005', 5, 0.00, 0.45),
  ('00000000-0000-0000-0000-000000002005', 6, 0.00, 0.45),
  ('00000000-0000-0000-0000-000000002005', 7, 0.00, 0.50),
  ('00000000-0000-0000-0000-000000002005', 8, 0.00, 0.50);
