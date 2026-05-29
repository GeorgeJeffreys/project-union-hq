/**
 * Seed script: "Project Union — DG x O&L Merger" scenario
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (service role bypasses RLS)
 *
 * Run:
 *   npx tsx scripts/seed-project-union.ts
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  console.log('Seeding "Project Union — DG x O&L Merger" scenario...\n');

  // ── 1. Scenario ─────────────────────────────────────────────────────────────
  const { data: scenario, error: scenarioErr } = await db
    .from('scenarios')
    .insert({
      name: 'Project Union — DG x O&L Merger',
      is_baseline: false,
      inputs: {
        trade_revenue: 40.9,
        us_revenue: 12.0,
        dtc_revenue: 3.7,
        avg_price_uplift_pct: 0,
        gross_margin_pct: 57.5,
        property: 3.8,
        headcount: 11.8,
        marketing: 2.2,
        other_overhead: 2.1,
        note: 'Combined DG + O&L. Post-synergy run-rate. £6.52m total synergy. Stated investment £5.5m; true cash ~£12-13m including combined debt.',
        combined_revenue_gbp_000: 63263,
        dg_revenue_gbp_000: 31118,
        ol_revenue_gbp_000: 28945,
        pre_synergy_ebitda_gbp_000: -51,
        post_synergy_ebitda_gbp_000: 6465,
        post_synergy_ebitda_margin_pct: 10.2,
        total_synergy_gbp_000: 6516,
        investment_cost_stated_gbp_000: 5501,
        investment_cost_incl_debt_gbp_000: 12000,
        headcount_pre_rationalisation: 188.6,
        headcount_post_rationalisation: 147,
        ftes_removed: 41.6,
        exit_value_ebitda_multiple_low: 8,
        exit_value_ebitda_multiple_high: 10,
        implied_ev_low_gbp_000: 52000,
        implied_ev_high_gbp_000: 65000,
      },
    })
    .select()
    .single();

  if (scenarioErr) throw scenarioErr;
  console.log(`✓ Scenario inserted: ${scenario.id}`);

  // ── 2. Recommendations ──────────────────────────────────────────────────────
  const recs = [
    {
      title: 'Headcount rationalisation — 41.6 FTE across 9 departments (£2.59m saving)',
      pillar: 'P03',
      tree_node: 'Cost · HC',
      impact_low: 2400,
      impact_high: 2591,
      approved: false,
      horizons: {
        h0_3: {
          owner: 'CFO + HR',
          actions: 'Map combined FTE pool by department. Directors/Board 3 FTE £649k; Sales 5 FTE £451k; Marketing 3 FTE £141k; Purchasing 3 FTE £136k; Admin/HR 2 FTE £113k; Export/CS 4 FTE £132k; Warehouse 5 FTE £173k; Accounts 3 FTE £156k; IT 1 FTE £84k. Note: O&L Inc US (50 FTE) excluded — model separately once US diligence complete.',
        },
        h3_12: {
          owner: 'CEO / CFO / HR Director',
          actions: 'Execute redundancy programme (41.6 FTE). Cost: £907k at 35% salary or £1.3m at 50%. Keep brand sales teams, studios, marketing and PD intact. Provide consultation period per UK employment law.',
        },
        h12_24: {
          owner: 'HR',
          actions: 'Full £2.59m annual saving at run-rate. Monitor warehouse and customer service capacity. Review O&L Inc US structure once diligence complete.',
        },
      },
    },
    {
      title: 'European network synergy — O&L Germany + France via DG showroom infrastructure (£700k revenue)',
      pillar: 'P01',
      tree_node: 'Rev · EU',
      impact_low: 420,
      impact_high: 700,
      approved: false,
      horizons: {
        h0_3: {
          owner: 'Group Sales Director',
          actions: 'Size the prize: O&L Germany ~£1m revenue, O&L France ~£1m. DG Munich (£150k/yr) and Paris (£173k/yr) showrooms operational. Close O&L Dusseldorf (£28.7k saving, £10k exit). DG model: £300k Germany + £400k France. O&L model: £500k each — reconcile.',
        },
        h3_12: {
          owner: 'European Sales Manager',
          actions: 'Integrate O&L product into DG Munich and Paris showrooms. Train DG European teams on O&L range. Activate O&L trade customer relationships through DG account management.',
        },
        h12_24: {
          owner: 'Group Sales Director',
          actions: 'Target £300k O&L Germany + £400k O&L France = £700k combined (£420k profit at 60%). Medium confidence — infrastructure exists, revenue uncontracted.',
        },
      },
    },
    {
      title: 'Property rationalisation — Latimer Place downsizing + DG NY closure (£290k annual saving)',
      pillar: 'P03',
      tree_node: 'Cost · Property',
      impact_low: 250,
      impact_high: 291,
      approved: false,
      horizons: {
        h0_3: {
          owner: 'CFO + COO',
          actions: 'DG NY office (£60k/yr, 2 staff): absorb into O&L Stamford — low execution risk. DG Latimer Place (£461k/yr): assess 50% downsizing — which functions remain, which move to Coronation Road. Chelsea Harbour 116a (£188k/yr) lease expires June 2026 — saving may occur regardless of deal, do not double-count.',
        },
        h3_12: {
          owner: 'COO / Facilities',
          actions: 'Execute DG NY closure (£30k exit cost). Negotiate Latimer Place partial surrender or sublease (£230.5k annual saving). Confirm Chelsea Harbour exit plan.',
        },
        h12_24: {
          owner: 'Finance',
          actions: 'Run-rate: DG NY £60k + Latimer Place £230.5k = £290.5k/yr. Chelsea Harbour £188k confirmed via natural expiry. Combined property saving ex-Merton: £478.5k/yr.',
        },
      },
    },
    {
      title: 'Asia-Pacific — O&L distribution via DG export manager (£125k incremental profit)',
      pillar: 'P01',
      tree_node: 'Rev · APAC',
      impact_low: 100,
      impact_high: 125,
      approved: false,
      horizons: {
        h0_3: {
          owner: 'DG Export Manager',
          actions: 'Map current O&L APAC customer relationships. DG export manager covers Asia-Pacific — assess incremental capacity to carry O&L brand. No additional headcount assumed.',
        },
        h3_12: {
          owner: 'DG Export Manager',
          actions: 'Begin representing O&L product through existing DG APAC customer relationships. Add O&L product to DG export presentations.',
        },
        h12_24: {
          owner: 'Group Sales Director',
          actions: 'Target £250k O&L APAC revenue (£125k profit at 50% margin). Medium confidence — channel exists, O&L product characterised as lower-growth than DG or RL.',
        },
      },
    },
    {
      title: 'O&L accessories + furniture — new category development leveraging DG capability (£500k profit, 2–3yr)',
      pillar: 'P01',
      tree_node: 'Revenue',
      impact_low: 300,
      impact_high: 500,
      approved: false,
      horizons: {
        h0_3: {
          owner: 'Creative/PD Director',
          actions: 'Feasibility: DG operates in accessories/furniture/cushions; O&L does not. Assess O&L customer appetite and DG sourcing capability. Min 2–3yr horizon. Do NOT model as Year 1 synergy. Revenue disagreement: DG £1m vs O&L £1.5m — aspirational.',
        },
        h3_12: {
          owner: 'Creative/PD Director + Group Sales Director',
          actions: 'If feasibility positive: develop pilot O&L accessories range via DG supply chain. Soft-launch to O&L trade accounts.',
        },
        h12_24: {
          owner: 'Group CEO',
          actions: 'Target £1m revenue at 50% margin (£500k profit) — Year 3 minimum. Treat as strategic development option, not merger synergy in base case.',
        },
      },
    },
  ];

  const { data: insertedRecs, error: recErr } = await db
    .from('recommendations')
    .insert(recs)
    .select();

  if (recErr) throw recErr;
  console.log(`✓ ${insertedRecs.length} recommendations inserted`);

  // ── 3. Cashflow (£000s per quarter) ─────────────────────────────────────────
  const recByTitle = Object.fromEntries(insertedRecs.map((r) => [r.title, r.id]));

  const cashflowRows = [
    // Headcount: redundancy Q2, savings ramp from Q2
    ...[[1,0,0],[2,1100,300],[3,0,648],[4,0,648],[5,0,648],[6,0,648],[7,0,648],[8,0,648]]
      .map(([q,c,s]) => ({ rec_id: recByTitle[recs[0].title], quarter:q, cost_out:c, saving_in:s })),
    // European network: revenue builds from Q3
    ...[[1,0,0],[2,0,0],[3,0,70],[4,0,105],[5,0,105],[6,0,140],[7,0,140],[8,0,140]]
      .map(([q,c,s]) => ({ rec_id: recByTitle[recs[1].title], quarter:q, cost_out:c, saving_in:s })),
    // Property: DG NY exit Q1, savings from Q2
    ...[[1,30,0],[2,0,60],[3,0,73],[4,0,73],[5,0,73],[6,0,73],[7,0,73],[8,0,73]]
      .map(([q,c,s]) => ({ rec_id: recByTitle[recs[2].title], quarter:q, cost_out:c, saving_in:s })),
    // APAC: builds from Q4
    ...[[1,0,0],[2,0,0],[3,0,0],[4,0,31],[5,0,31],[6,0,31],[7,0,31],[8,0,31]]
      .map(([q,c,s]) => ({ rec_id: recByTitle[recs[3].title], quarter:q, cost_out:c, saving_in:s })),
    // Accessories: dev cost Q1-Q4, revenue Y2+
    ...[[1,100,0],[2,150,0],[3,50,0],[4,50,0],[5,0,63],[6,0,125],[7,0,125],[8,0,125]]
      .map(([q,c,s]) => ({ rec_id: recByTitle[recs[4].title], quarter:q, cost_out:c, saving_in:s })),
  ];

  const { error: cashErr } = await db.from('cashflow').insert(cashflowRows);
  if (cashErr) throw cashErr;
  console.log(`✓ ${cashflowRows.length} cashflow rows inserted`);

  // ── 4. Additional options ────────────────────────────────────────────────────
  const options = [
    { workstream:'revenue', stage:'could', title:'Dubai — combine DG and O&L operations into single group office', description:'Both DG and O&L have Dubai presence. 25% margin assumption reflects cost absorption. Validate revenue before committing.', impact_low:50000, impact_high:63000, cash_cost:20000, tree_node:'Rev · Other', rationale:'Medium-low confidence. Validate revenue and cost structure.' },
    { workstream:'revenue', stage:'could', title:'Asia-Pacific — O&L brand distributed via DG export manager', description:'DG export manager covers APAC. O&L leverages channel without additional headcount.', impact_low:100000, impact_high:125000, cash_cost:0, tree_node:'Rev · APAC', rationale:'Medium confidence. No new infrastructure required.' },
    { workstream:'revenue', stage:'could', title:'O&L accessories, furniture and cushions — new category via DG capability', description:'2–3 year development horizon minimum. Not a year-1 synergy.', impact_low:300000, impact_high:500000, cash_cost:200000, tree_node:'Revenue', rationale:'Low confidence as synergy. Treat as strategic option.' },
    { workstream:'cost', stage:'should', title:'Other overhead rationalisation — motor, travel, legal (£215k saving)', description:'Motor 25% saving £28k; Travel 25% saving £54k; Legal/professional O&L eliminated £134k.', impact_low:200000, impact_high:216000, cash_cost:0, tree_node:'Cost · Other', rationale:'High confidence — duplicate fixed overhead elimination.' },
    { workstream:'cost', stage:'should', title:'Subsidiary savings — Germany + France commissions + DG NY office (£175k)', description:'Germany commission £50k; France commission £65k; DG NY office £60k.', impact_low:160000, impact_high:175000, cash_cost:40000, tree_node:'Cost · Other', rationale:'High confidence once lease exits executed.' },
    { workstream:'cost', stage:'can', title:'IT systems consolidation — single platform within 24 months', description:'£500k budget, no spec provided. CapEx listed as "??" in source model — unquantified.', impact_low:0, impact_high:84000, cash_cost:500000, tree_node:'Cost · IT', rationale:'High risk of overrun without defined spec. Scope before committing.' },
  ];

  const { error: optErr } = await db.from('options').insert(options);
  if (optErr) throw optErr;
  console.log(`✓ ${options.length} options inserted`);

  // ── 5. Verify ────────────────────────────────────────────────────────────────
  console.log('\nVerification:');
  const { data: scenarios } = await db.from('scenarios').select('id, name').order('created_at');
  scenarios?.forEach((s) => console.log(`  scenario: ${s.name}`));

  const { count: recCount } = await db.from('recommendations').select('*', { count: 'exact', head: true });
  console.log(`  recommendations total: ${recCount}`);

  const { count: cfCount } = await db.from('cashflow').select('*', { count: 'exact', head: true });
  console.log(`  cashflow rows total: ${cfCount}`);

  const { count: optCount } = await db.from('options').select('*', { count: 'exact', head: true });
  console.log(`  options total: ${optCount}`);

  console.log('\nDone.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
