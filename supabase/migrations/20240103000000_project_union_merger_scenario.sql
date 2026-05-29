-- ── Project Union — DG × O&L Merger Scenario ────────────────────────────────
-- Source: DG___O_L_-_Synergy_Savings__3_Dec_25.xlsx (internally authored, Dec 2025)
-- Inserts a named scenario, additional synergy recommendations, and workstream options
-- that complement the high-level merger recommendations added in 20240102000000_ol_merger.sql

-- ── SCENARIO ─────────────────────────────────────────────────────────────────
-- Inputs mapped to ScenarioInputs shape (all revenue/cost figures in £m).
-- Revenue: DG trade £18.9m + O&L UK/EU trade £22.0m | US: DG (via O&L Inc) £5.4m + O&L US £6.6m
-- Post-synergy overheads: property £3.8m, headcount £11.8m after 41.6 FTE reduction (£2.6m saving)
INSERT INTO scenarios (name, is_baseline, inputs) VALUES (
  'Project Union — DG x O&L Merger',
  false,
  '{
    "trade_revenue": 40.9,
    "us_revenue": 12.0,
    "dtc_revenue": 3.7,
    "avg_price_uplift_pct": 0,
    "gross_margin_pct": 57.5,
    "property": 3.8,
    "headcount": 11.8,
    "marketing": 2.2,
    "other_overhead": 2.1,
    "note": "Combined DG + O&L. Post-synergy run-rate. £6.52m total synergy (cost £4.9m high-confidence + growth £1.6m aspirational). Stated investment cost £5.5m; true cash requirement ~£12-13m including combined debt. Pre-synergy EBITDA -£51k; post-synergy £6.47m (10.2% margin). Excludes O&L Inc US (50 FTE) from cost synergy model — major analytical gap.",
    "combined_revenue_gbp_000": 63263,
    "dg_revenue_gbp_000": 31118,
    "ol_revenue_gbp_000": 28945,
    "combined_gross_margin_pct": 57.5,
    "pre_synergy_ebitda_gbp_000": -51,
    "post_synergy_ebitda_gbp_000": 6465,
    "post_synergy_ebitda_margin_pct": 10.2,
    "total_synergy_gbp_000": 6516,
    "cost_synergy_gbp_000": 4909,
    "growth_synergy_gbp_000": 1608,
    "investment_cost_stated_gbp_000": 5501,
    "investment_cost_incl_debt_gbp_000": 12000,
    "headcount_pre_rationalisation": 188.6,
    "headcount_post_rationalisation": 147,
    "ftes_removed": 41.6,
    "colefax_benchmark_revenue_gbp_000": 110000,
    "exit_value_ebitda_multiple_low": 8,
    "exit_value_ebitda_multiple_high": 10,
    "implied_ev_low_gbp_000": 52000,
    "implied_ev_high_gbp_000": 65000
  }'
);

-- ── ADDITIONAL SYNERGY RECOMMENDATIONS ───────────────────────────────────────
-- The three core merger recommendations (integration programme, Merton exit, US channel)
-- are already seeded in 20240102000000_ol_merger.sql.
-- This migration adds the remaining identified synergy streams.

INSERT INTO recommendations
  (title, pillar, tree_node, impact_low, impact_high, approved, horizons)
VALUES

-- 1. Headcount: departmental rationalisation detail (supplements the board-level rec already seeded)
(
  'Headcount rationalisation — 41.6 FTE across 9 departments (£2.59m saving)',
  'P03',
  'Cost · HC',
  2400, 2591,
  false,
  '{
    "h0_3": {
      "owner": "CFO + HR",
      "actions": "Map combined FTE pool by department. Key savings: Directors/Board 3 FTE £649k; Sales 5 FTE £451k; Marketing/PR 3 FTE £141k; Purchasing 3 FTE £136k; Admin/HR 2 FTE £113k; Export/CS 4 FTE £132k; Warehouse 5 FTE £173k; Accounts 3 FTE £156k; IT 1 FTE £84k. Confirm retained headcount structure. Note: O&L Inc US (50 FTE) excluded — model this separately once US diligence complete."
    },
    "h3_12": {
      "owner": "CEO / CFO / HR Director",
      "actions": "Execute redundancy programme (41.6 FTE). Redundancy cost: £907k at 35% salary, or up to £1.3m at 50% (use 50% in base case per DG annotation). Ensure brand sales teams, studios, marketing and PD kept intact per brand — synergies from shared back-office only. Provide consultation period per UK employment law."
    },
    "h12_24": {
      "owner": "HR",
      "actions": "Full £2.59m annual saving at run-rate. Monitor combined entity capacity — particularly warehouse and customer service where integration risk is highest. Review O&L Inc US structure once diligence complete (50 FTE currently black box)."
    }
  }'
),

-- 2. European network: Germany + France combined (more detailed than the options already seeded)
(
  'European network synergy — O&L Germany + France via DG showroom infrastructure (£700k revenue)',
  'P01',
  'Rev · EU',
  420, 700,
  false,
  '{
    "h0_3": {
      "owner": "Group Sales Director",
      "actions": "Size the prize: O&L Germany revenues currently ~£1m, O&L France revenues ~£1m. DG Munich showroom (£150k/yr) and DG Paris showroom (£173k/yr) already operational. Close O&L Dusseldorf (£28.7k saving, £10k exit cost). Absorb O&L France into DG Paris. Model incremental O&L revenue. Note: DG model uses £300k Germany + £400k France; O&L internal model used £500k each — reconcile."
    },
    "h3_12": {
      "owner": "European Sales Manager",
      "actions": "Integrate O&L product into DG Munich and Paris showroom. Train DG European sales teams on O&L product range. Activate O&L trade customer relationships in Germany and France through DG account management. Set incremental O&L revenue targets by showroom."
    },
    "h12_24": {
      "owner": "Group Sales Director",
      "actions": "Target £300k incremental O&L Germany revenue + £400k incremental O&L France revenue = £700k combined (£420k profit at 60% margin). Monitor actual vs model. This is medium-confidence infrastructure exists but growth is uncontracted."
    }
  }'
),

-- 3. Dubai operations consolidation
(
  'Dubai operations — consolidate DG and O&L into single group office (£63k revenue, £62.5k profit)',
  'P03',
  'Cost · Other',
  50, 63,
  false,
  '{
    "h0_3": {
      "owner": "COO",
      "actions": "Map current DG and O&L Dubai operations: headcount, lease obligations, customer relationships, revenue by brand. Identify consolidation structure — which entity leads, which space is retained."
    },
    "h3_12": {
      "owner": "Regional Manager",
      "actions": "Consolidate into single group office. Rationalise headcount where duplicate. Maintain customer coverage for both brands. Note: 25% margin assumption in synergy model is unusually low — suggests significant cost absorption. Validate revenue assumption."
    },
    "h12_24": {
      "owner": "Group Sales Director",
      "actions": "Target £250k incremental revenue (£62.5k profit at 25% — very conservative margin likely reflecting cost absorption). Revisit margin assumption once cost structure confirmed."
    }
  }'
),

-- 4. Asia-Pacific distribution via DG export manager
(
  'Asia-Pacific — O&L distribution via DG export manager (£125k incremental profit)',
  'P01',
  'Rev · APAC',
  100, 125,
  false,
  '{
    "h0_3": {
      "owner": "DG Export Manager",
      "actions": "Map current O&L APAC customer relationships and revenue. DG export manager already covers Asia-Pacific — assess incremental capacity to carry O&L brand. No additional headcount assumed."
    },
    "h3_12": {
      "owner": "DG Export Manager",
      "actions": "Begin representing O&L product through existing DG APAC customer relationships. Add O&L product to DG export sample books and trade presentations. Set APAC revenue targets for O&L brand."
    },
    "h12_24": {
      "owner": "Group Sales Director",
      "actions": "Target £250k incremental O&L APAC revenue (£125k profit at 50% margin). Medium confidence — no new infrastructure required, channel exists, but O&L product line characterised as lower-growth than DG or RL."
    }
  }'
),

-- 5. Property: remaining savings (Latimer Place downsizing, DG NY, Chelsea Harbour)
(
  'Property rationalisation — Latimer Place downsizing + DG NY closure (£290k annual saving)',
  'P03',
  'Cost · Property',
  250, 291,
  false,
  '{
    "h0_3": {
      "owner": "CFO + COO",
      "actions": "DG NY office (£60k/yr, 2 staff): absorb 2 staff into O&L Stamford operation — low execution risk, confirmed in synergy model. DG Latimer Place (£461k/yr total): assess 50% downsizing assumption — which functions remain, which move to Coronation Road. Note: O&L Chelsea Harbour 116a (£188k/yr) lease expires June 2026 — this saving may occur regardless of merger; do not double-count as synergy."
    },
    "h3_12": {
      "owner": "COO / Facilities",
      "actions": "Execute DG NY closure (£30k exit cost). Negotiate Latimer Place partial surrender or sublease (£230.5k annual saving, 50% of £461k). Confirm O&L Chelsea Harbour exit plan — natural expiry June 2026, zero exit cost."
    },
    "h12_24": {
      "owner": "Finance",
      "actions": "Full run-rate: DG NY £60k + Latimer Place partial £230.5k = £290.5k annual saving. Chelsea Harbour £188k saving confirmed (natural expiry). Combined property saving ex-Merton: £478.5k/yr. Merton modelled separately (£1.41m saving, £3.87m cost)."
    }
  }'
),

-- 6. O&L accessories, furniture and cushions — new category development
(
  'O&L accessories + furniture — new category development leveraging DG capability (£500k profit, 2–3yr)',
  'P01',
  'Revenue',
  300, 500,
  false,
  '{
    "h0_3": {
      "owner": "Creative/PD Director",
      "actions": "Feasibility assessment: DG already operates in retail accessories, furniture and cushions. O&L does not. Assess O&L customer appetite, margin profile, and DG manufacturing/sourcing capability. NOTE: This is a new product category launch — minimum 2–3 year horizon. Do not model as Year 1 synergy. O&L internal model used £1.5m revenue; DG model used £1.0m — significant gap, treat as aspirational."
    },
    "h3_12": {
      "owner": "Creative/PD Director + Group Sales Director",
      "actions": "If feasibility positive: develop pilot O&L accessories range. Source through existing DG supply chain. Soft-launch to O&L trade accounts. Test margin — model assumes 50% but accessories margin in practice varies widely."
    },
    "h12_24": {
      "owner": "Group CEO",
      "actions": "Target £1m revenue at 50% margin (£500k profit) — Year 3 horizon minimum. Low confidence as a synergy item; treat as strategic development option, not merger synergy in base case."
    }
  }'
);

-- ── CASHFLOW: new recommendations (8 quarters, £000s) ──────────────────────
-- Headcount rationalisation
WITH hc_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'Headcount rationalisation — 41.6 FTE%'
  LIMIT 1
),
-- European network
eu_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'European network synergy%'
  LIMIT 1
),
-- Dubai
dubai_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'Dubai operations%'
  LIMIT 1
),
-- APAC
apac_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'Asia-Pacific%'
  LIMIT 1
),
-- Property (Latimer / NY)
prop_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'Property rationalisation — Latimer%'
  LIMIT 1
),
-- Accessories / furniture
acc_rec AS (
  SELECT id FROM recommendations
  WHERE title LIKE 'O&L accessories%'
  LIMIT 1
)
INSERT INTO cashflow (rec_id, quarter, cost_out, saving_in)
-- Headcount: redundancy cost Q2 (£1.1m at 50%), savings ramp from Q2
SELECT id, 1,    0,    0 FROM hc_rec UNION ALL
SELECT id, 2, 1100,  300 FROM hc_rec UNION ALL
SELECT id, 3,    0,  648 FROM hc_rec UNION ALL
SELECT id, 4,    0,  648 FROM hc_rec UNION ALL
SELECT id, 5,    0,  648 FROM hc_rec UNION ALL
SELECT id, 6,    0,  648 FROM hc_rec UNION ALL
SELECT id, 7,    0,  648 FROM hc_rec UNION ALL
SELECT id, 8,    0,  648 FROM hc_rec UNION ALL
-- European network: zero cost, revenue builds from Q3
SELECT id, 1,  0,   0 FROM eu_rec UNION ALL
SELECT id, 2,  0,   0 FROM eu_rec UNION ALL
SELECT id, 3,  0,  70 FROM eu_rec UNION ALL
SELECT id, 4,  0, 105 FROM eu_rec UNION ALL
SELECT id, 5,  0, 105 FROM eu_rec UNION ALL
SELECT id, 6,  0, 140 FROM eu_rec UNION ALL
SELECT id, 7,  0, 140 FROM eu_rec UNION ALL
SELECT id, 8,  0, 140 FROM eu_rec UNION ALL
-- Dubai: nominal cost Q1, small saving from Q3
SELECT id, 1, 20,  0 FROM dubai_rec UNION ALL
SELECT id, 2,  0,  0 FROM dubai_rec UNION ALL
SELECT id, 3,  0, 16 FROM dubai_rec UNION ALL
SELECT id, 4,  0, 16 FROM dubai_rec UNION ALL
SELECT id, 5,  0, 16 FROM dubai_rec UNION ALL
SELECT id, 6,  0, 16 FROM dubai_rec UNION ALL
SELECT id, 7,  0, 16 FROM dubai_rec UNION ALL
SELECT id, 8,  0, 16 FROM dubai_rec UNION ALL
-- APAC: zero cost, revenue builds from Q4
SELECT id, 1, 0,   0 FROM apac_rec UNION ALL
SELECT id, 2, 0,   0 FROM apac_rec UNION ALL
SELECT id, 3, 0,   0 FROM apac_rec UNION ALL
SELECT id, 4, 0,  31 FROM apac_rec UNION ALL
SELECT id, 5, 0,  31 FROM apac_rec UNION ALL
SELECT id, 6, 0,  31 FROM apac_rec UNION ALL
SELECT id, 7, 0,  31 FROM apac_rec UNION ALL
SELECT id, 8, 0,  31 FROM apac_rec UNION ALL
-- Property: DG NY exit cost Q1, savings from Q2; Latimer from Q3
SELECT id, 1, 30,   0 FROM prop_rec UNION ALL
SELECT id, 2,  0,  60 FROM prop_rec UNION ALL
SELECT id, 3,  0,  73 FROM prop_rec UNION ALL
SELECT id, 4,  0,  73 FROM prop_rec UNION ALL
SELECT id, 5,  0,  73 FROM prop_rec UNION ALL
SELECT id, 6,  0,  73 FROM prop_rec UNION ALL
SELECT id, 7,  0,  73 FROM prop_rec UNION ALL
SELECT id, 8,  0,  73 FROM prop_rec UNION ALL
-- Accessories: development cost Q1-Q4, revenue only from Y2 (Q5+)
SELECT id, 1, 100,   0 FROM acc_rec UNION ALL
SELECT id, 2, 150,   0 FROM acc_rec UNION ALL
SELECT id, 3,  50,   0 FROM acc_rec UNION ALL
SELECT id, 4,  50,   0 FROM acc_rec UNION ALL
SELECT id, 5,   0,  63 FROM acc_rec UNION ALL
SELECT id, 6,   0, 125 FROM acc_rec UNION ALL
SELECT id, 7,   0, 125 FROM acc_rec UNION ALL
SELECT id, 8,   0, 125 FROM acc_rec;

-- ── ADDITIONAL OPTIONS ────────────────────────────────────────────────────────
-- Supplements the 6 options seeded in 20240102000000_ol_merger.sql
INSERT INTO options
  (workstream, stage, title, description, impact_low, impact_high, cash_cost, tree_node, rationale)
VALUES
(
  'revenue', 'could',
  'Dubai — combine DG and O&L operations into single group office',
  'Both DG and O&L have Dubai presence. Consolidation into single operation reduces overhead and may increase combined sales coverage. 25% margin assumption in synergy model reflects significant cost absorption.',
  50000, 63000, 20000,
  'Rev · Other',
  'Medium-low confidence. Synergy model uses very conservative 25% margin — validate revenue and cost structure before committing.'
),
(
  'revenue', 'could',
  'Asia-Pacific — O&L brand distributed via DG export manager',
  'DG export manager already covers Asia-Pacific. O&L could leverage this channel without additional headcount cost.',
  100000, 125000, 0,
  'Rev · APAC',
  'Medium confidence. No new infrastructure required. O&L product lower-growth than DG or RL — manage expectations accordingly.'
),
(
  'revenue', 'could',
  'O&L accessories, furniture and cushions — new category via DG capability',
  'O&L does not operate in retail accessories/furniture/cushions. DG does. New O&L product line could be developed using combined sourcing and PD capability. Minimum 2–3 year horizon.',
  300000, 500000, 200000,
  'Revenue',
  'Low confidence as a synergy item. New category launch — treat as strategic development option not year-1 synergy. O&L and DG models disagree by 50% on revenue (£1m vs £1.5m).'
),
(
  'cost', 'should',
  'Other overhead rationalisation — motor, travel, legal/professional (£215k saving)',
  'Motor vehicles: 25% saving on combined cost (£28k). Travel: 25% saving on combined cost (£54k). Legal/professional: O&L costs eliminated, DG retained (£134k saving). Total £215.6k.',
  200000, 216000, 0,
  'Cost · Other',
  'High confidence — straightforward elimination of duplicate fixed overhead on consolidation.'
),
(
  'cost', 'should',
  'Subsidiary savings — Germany + France commission + DG NY office (£175k saving)',
  'O&L Germany commission eliminated as absorbed into DG Munich (£50k). O&L France commission eliminated as absorbed into DG Paris (£65k). DG NY office closure (2 staff, rent + utilities, £60k).',
  160000, 175000, 40000,
  'Cost · Other',
  'High confidence once lease exits executed. DG NY is confirmed in synergy model — 2 staff absorbed into O&L Stamford. Germany and France savings contingent on European integration going smoothly.'
),
(
  'cost', 'can',
  'IT systems consolidation — migrate to single platform within 24 months',
  'Model allocates £500k for IT systems and integration consultancy. No system specification provided. Two-year programme timeline assumed. Technology CapEx listed as "??" in model — unquantified.',
  0, 84000,
  500000,
  'Cost · IT',
  'Soft estimate — significant risk of cost overrun without a defined spec. Engage IT advisors in H1 to scope. Annual saving of £84k (1 FTE IT overhead reduction) is modest relative to implementation cost.'
);
