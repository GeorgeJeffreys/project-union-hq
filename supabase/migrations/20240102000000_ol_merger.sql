-- SCENARIO: Merger Base Case
-- (growth synergies discounted 50%, cost synergies full)
INSERT INTO scenarios (name, is_baseline, inputs) VALUES
('Merger Base Case', false, '{
  "trade_revenue": 37.0,
  "us_revenue": 12.0,
  "asp_uplift": 3,
  "gross_margin": 57.5,
  "property": 3.8,
  "headcount": 12.5,
  "marketing": 2.2,
  "other_overhead": 3.5,
  "note": "DG+O&L combined. Growth synergies discounted 50%. Cost synergies full run-rate. Excludes debt clean-up cost.",
  "combined_revenue": 63263,
  "synergy_total": 5700,
  "investment_cost_stated": 5501,
  "investment_cost_incl_debt": 12000
}'),
('Merger Upside (full synergies)', false, '{
  "trade_revenue": 40.0,
  "us_revenue": 15.0,
  "asp_uplift": 5,
  "gross_margin": 58.5,
  "property": 3.5,
  "headcount": 11.8,
  "marketing": 2.5,
  "other_overhead": 3.2,
  "note": "DG+O&L combined. Full £6.5m synergy run-rate including all growth items. Year 3 horizon.",
  "combined_revenue": 63263,
  "synergy_total": 6516,
  "investment_cost_stated": 5501,
  "investment_cost_incl_debt": 12000
}');

-- RECOMMENDATIONS: O&L merger
INSERT INTO recommendations
  (title, pillar, tree_node, impact_low, impact_high,
   approved, horizons)
VALUES (
  'O&L merger — integration and synergy capture programme',
  'P05',
  'Strategic Transaction',
  4500,
  6500,
  false,
  '{
    "h0_3": {
      "owner": "CEO + CFO",
      "actions": "Commission O&L Inc US diligence — revenue, P&L, headcount, customer concentration (currently a black box — 50 FTE entirely unmodelled). Confirm O&L debt position: Trade £1.75m + CBIL £300k + PGO £400k + IFF £600k = £3.05m. Verify Coronation Road warehouse capacity to absorb O&L Merton stock — physical survey required. Reconcile model inconsistencies. Engage M&A legal counsel and tax advisors. Negotiate Heads of Terms."
    },
    "h3_12": {
      "owner": "CEO / CFO / Integration lead",
      "actions": "Sign SPA. Day-1 integration: rationalise Board (7→4: CEO, Creative/PD Director, Group Sales Director, CFO). Execute headcount programme (41.6 FTE, £907k–£1.3m redundancy cost). Begin Merton warehouse lease exit negotiation — lease runs to Jan 2029, £3.87m break cost. Close Dusseldorf office (absorbed into DG Munich). Close DG New York office (2 staff absorbed into O&L Stamford). Confirm Chelsea Harbour 116a exit (lease expiry June 2026). Migrate back-office functions to single platform."
    },
    "h12_24": {
      "owner": "Group CEO",
      "actions": "Activate growth synergies: O&L Germany via DG Munich showroom (£300k revenue uplift). O&L France via DG Paris showroom (£400k revenue uplift). DG finished products actively promoted by O&L US sales team (£1m revenue uplift — highest confidence growth item). Begin IT systems consolidation (£500k budget, 24-month programme). Target combined entity EBITDA £5.7m base / £6.5m upside. Commission M&A adviser for exit process at £5m+ EBITDA run-rate."
    }
  }'
),
(
  'Merton warehouse lease exit — £1.4m annual saving, £3.87m one-off cost',
  'P03',
  'Cost · Property',
  1200,
  1415,
  false,
  '{
    "h0_3": {
      "owner": "CFO + COO",
      "actions": "Commission physical survey of DG Coronation Road to confirm capacity for O&L stock (70k sqft + 20k mezzanine vs O&L 34.5k sqft Merton). Obtain dilapidations survey. Get legal advice on lease break vs run-to-expiry (Jan 2029). Model IRR of break (£3.87m cost, £1.41m/yr saving = 2.7yr payback) vs hold."
    },
    "h3_12": {
      "owner": "COO",
      "actions": "Execute lease break if capacity confirmed. Manage stock relocation to Coronation Road. Decommission Merton. Redundancy for warehouse FTEs not transferred (5 FTE, £173k saving)."
    },
    "h12_24": {
      "owner": "Finance",
      "actions": "Full £1.41m annual saving at run-rate. Monitor Coronation Road utilisation. Review if additional storage required."
    }
  }'
),
(
  'O&L US channel — internalise DG distribution via O&L Inc Stamford',
  'P04',
  'Rev · US',
  500,
  1000,
  false,
  '{
    "h0_3": {
      "owner": "CEO",
      "actions": "PRIORITY DILIGENCE: commission full O&L Inc audit — revenue by brand (DG vs O&L vs RL), P&L, headcount structure, customer relationships, contractual obligations. This is the primary strategic rationale for the merger and is currently a complete black box."
    },
    "h3_12": {
      "owner": "US Sales Director (O&L Inc)",
      "actions": "Post-merger: activate O&L Inc sales team to actively promote DG finished goods alongside O&L product. Set incremental DG revenue targets for US team. Integrate DG product training into O&L Inc onboarding."
    },
    "h12_24": {
      "owner": "Group Sales Director",
      "actions": "Target £1m incremental DG revenue through O&L US channel (highest confidence growth synergy item — existing relationship, existing channel, no new infrastructure). Track as separate P&L line."
    }
  }'
);

-- CASHFLOW: O&L merger (large upfront, phased savings)
WITH merger_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'O&L merger%'
  LIMIT 1
),
merton_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'Merton warehouse%'
  LIMIT 1
),
us_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'O&L US channel%'
  LIMIT 1
)
INSERT INTO cashflow (rec_id, quarter, cost_out, saving_in)
-- Merger programme cashflow
SELECT id, 1, 500, 0 FROM merger_rec UNION ALL
SELECT id, 2, 1500, 200 FROM merger_rec UNION ALL
SELECT id, 3, 2000, 600 FROM merger_rec UNION ALL
SELECT id, 4, 500, 1000 FROM merger_rec UNION ALL
SELECT id, 5, 200, 1200 FROM merger_rec UNION ALL
SELECT id, 6, 200, 1400 FROM merger_rec UNION ALL
SELECT id, 7, 100, 1400 FROM merger_rec UNION ALL
SELECT id, 8, 100, 1400 FROM merger_rec UNION ALL
-- Merton warehouse cashflow
SELECT id, 1, 3874, 0 FROM merton_rec UNION ALL
SELECT id, 2, 0, 0 FROM merton_rec UNION ALL
SELECT id, 3, 0, 354 FROM merton_rec UNION ALL
SELECT id, 4, 0, 354 FROM merton_rec UNION ALL
SELECT id, 5, 0, 354 FROM merton_rec UNION ALL
SELECT id, 6, 0, 354 FROM merton_rec UNION ALL
SELECT id, 7, 0, 354 FROM merton_rec UNION ALL
SELECT id, 8, 0, 354 FROM merton_rec UNION ALL
-- US channel cashflow
SELECT id, 1, 0, 0 FROM us_rec UNION ALL
SELECT id, 2, 0, 0 FROM us_rec UNION ALL
SELECT id, 3, 50, 0 FROM us_rec UNION ALL
SELECT id, 4, 50, 100 FROM us_rec UNION ALL
SELECT id, 5, 0, 200 FROM us_rec UNION ALL
SELECT id, 6, 0, 250 FROM us_rec UNION ALL
SELECT id, 7, 0, 250 FROM us_rec UNION ALL
SELECT id, 8, 0, 250 FROM us_rec;

-- OPTIONS: O&L merger workstream options
INSERT INTO options
  (workstream, stage, title, description,
   impact_low, impact_high, cash_cost,
   tree_node, rationale)
VALUES
(
  'revenue', 'should',
  'O&L US channel — DG finished goods via O&L Inc Stamford',
  'O&L already distributes DG brand in US. O&L Inc has ~50 staff and established trade relationships. Incremental DG finished goods revenue through existing channel — no new infrastructure required.',
  500000, 1000000, 50000,
  'Rev · US',
  'Highest confidence growth synergy. Existing relationship, existing channel, no new infrastructure. Primary strategic rationale for the merger from DG perspective.'
),
(
  'revenue', 'could',
  'O&L Germany via DG Munich showroom infrastructure',
  'O&L has no showroom in Germany. DG has Munich showroom and local team. O&L German revenues ~£1m could grow to £1.5m through DG infrastructure.',
  180000, 300000, 0,
  'Rev · EU',
  'Medium confidence. Infrastructure exists but revenue growth is uncontracted. O&L internal model used £500k; DG model used £300k.'
),
(
  'revenue', 'could',
  'O&L France via DG Paris showroom infrastructure',
  'O&L has no showroom in France. DG has Paris showroom and team. O&L France revenues could grow through DG channel.',
  240000, 400000, 0,
  'Rev · EU',
  'Medium confidence. Paris showroom exists. No activation plan in place.'
),
(
  'cost', 'should',
  'Merton warehouse exit — absorb into DG Coronation Road',
  'O&L Merton warehouse 34,500 sq ft, lease to Jan 2029. DG Coronation Road has 70k + 20k mezzanine sq ft. Exit saves £1.41m/yr, costs £3.87m one-off (lease break, dilapidations, relocation).',
  1200000, 1415000, 3874000,
  'Cost · Property',
  'Highest confidence cost synergy post-verification. Payback 2.7 years. Capacity assumption must be physically verified before committing.'
),
(
  'cost', 'can',
  'Board rationalisation — 7 directors to 4',
  'Combined entity board reduced: CEO, Creative/PD Director, Group Sales Director, CFO. Saves £649k including 1 O&L Sales Director moving to Group board role.',
  600000, 649000, 300000,
  'Cost · HC',
  'High confidence. Standard post-merger governance rationalisation. Part of wider 41.6 FTE programme saving £2.59m total.'
),
(
  'cost', 'can',
  'Back-office headcount rationalisation — 41.6 FTE across 9 departments',
  'Duplicate functions across DG and O&L: sales, marketing, purchasing, admin, customer service, warehouse, accounts, IT. Average saving £62.3k per FTE.',
  2400000, 2591000, 907000,
  'Cost · HC',
  'High confidence, bottom-up departmental modelling. Note: O&L Inc US (50 FTE) excluded — major analytical gap. Redundancy cost £907k at 35% or £1.3m at 50% of salary.'
);

-- TASKS: O&L merger discovery tasks
INSERT INTO tasks (lane, week, title, type, owner, notes)
VALUES
('Discovery', 2,
 'O&L Inc US diligence — commission revenue, P&L and headcount audit',
 'analysis', 'George',
 'Critical gap: 50-FTE US operation is primary merger rationale but entirely unmodelled. Must cover: revenue by brand (DG vs O&L vs RL), cost structure, customer concentration, contractual obligations.'),
('Discovery', 2,
 'Coronation Road capacity survey — can it absorb O&L Merton stock?',
 'analysis', 'COO',
 'Physical verification required before Merton lease exit can be committed. DG has 70k + 20k mezzanine sqft. O&L Merton is 34.5k sqft. May require fit-out.'),
('Discovery', 3,
 'O&L debt reconciliation — Trade £1.75m + CBIL £300k + PGO £400k + IFF £600k',
 'problem', 'CFO',
 'True cash cost of deal is ~£12-13m (stated £5.5m + ~£6.55m combined debt). This changes the Dunelm financing conversation entirely. Confirm all figures with O&L management accounts.'),
('Revenue', 3,
 'O&L Germany and France revenue opportunity — size the prize',
 'analysis', 'George',
 'DG has Munich and Paris showrooms; O&L has neither. Model incremental O&L revenue through DG infrastructure. DG model uses £300k Germany, £400k France. O&L model uses £500k each.'),
('Cost', 3,
 'Merton warehouse lease break analysis — break vs run to Jan 2029',
 'problem', 'CFO',
 'Break cost £3.87m (£3.12m rent + £450k dilapidations + £300k relocation). Annual saving £1.41m. Payback 2.7yrs. Compare NPV of break vs run-to-expiry vs sublease.'),
('Client', 4,
 'O&L merger case presentation to Simon — strategic rationale and decision gate',
 'discussion', 'George + Simon',
 'Present: synergy case £5.7m base / £6.5m upside; true cash requirement £12-13m; 3 strategic choices (proceed/pause/reject); diligence gaps to resolve before HoT.');
