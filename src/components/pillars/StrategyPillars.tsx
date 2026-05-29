'use client';

import { useState } from 'react';

type RAG = 'R' | 'A' | 'G';

const BLUE = '#1E3D6B';
const BLUE_SOFT = '#E8EEF7';

const PILLARS = [
  {
    code: 'P1',
    name: 'Trade Recovery',
    tactics: ['Reactivate 600+ dormant accounts via inside-sales', 'Account segmentation by revenue potential', 'Retention programme for top 200 accounts', 'Bi-weekly commercial pipeline review'],
    people: ['Commercial Director', 'Inside-sales lead × 3', 'Account managers (existing)'],
    process: ['CRM account health scoring', 'Weekly pipeline dashboard', 'Dormant account playbook'],
    kpis: [{ label: 'Active account count', status: 'R' as RAG }, { label: 'Revenue LTM', status: 'A' as RAG }],
    ceoLever: 'Reactivate 600 dormant accounts personally; set account retention as a board KPI',
  },
  {
    code: 'P2',
    name: 'Pricing & Margin',
    tactics: ['3–8% price increase on Signature + archive', 'Premium line repricing vs Colefax benchmark', 'Mix shift toward high-margin ranges', 'Discounting governance & approval gate'],
    people: ['Pricing analyst', 'MD approval gate', 'Sales team briefing'],
    process: ['Price-book governance process', 'Elasticity model by SKU', 'Quarterly price-review cadence'],
    kpis: [{ label: 'ASP vs prior year', status: 'R' as RAG }, { label: 'Gross margin %', status: 'A' as RAG }],
    ceoLever: 'Approve 3–8% price increase on Signature + archive; hold the line on discounting',
  },
  {
    code: 'P3',
    name: 'Cost Restructuring',
    tactics: ['Serve Latimer Place break notice by 31 Mar', 'Complete dilapidations and exit by 30 Jun', 'EU entity consolidation (FR + DE → 1 sub)', 'Retender logistics across 2 providers'],
    people: ['CFO-led programme office', 'HR for management restructure', 'External legal (EU consolidation)'],
    process: ['PMO weekly tracking', 'Legal workstream (entity consolidation)', 'Headcount attrition monitoring'],
    kpis: [{ label: 'Overhead / revenue %', status: 'R' as RAG }, { label: 'Property cost (£m)', status: 'A' as RAG }],
    ceoLever: 'Sign Latimer Place break notice by 31 March; own EU legal consolidation timeline',
  },
  {
    code: 'P4',
    name: 'US Market',
    tactics: ['Hire A&D sales leads (NYC + LA) within 90 days', 'Sign 12 new wholesale showroom agreements H1', 'Pilot DTC subscription sampling programme', 'Appoint contract specification coordinator'],
    people: ['US Country Manager', '2 × A&D sales executives', 'Showroom partnership manager'],
    process: ['US weekly reporting cadence', 'Showroom KPI tracker', 'A&D specification pipeline review'],
    kpis: [{ label: 'US revenue (£m)', status: 'A' as RAG }, { label: 'A&D pipeline value', status: 'G' as RAG }],
    ceoLever: 'Co-sponsor first US showroom openings; hire US Country Manager directly',
  },
  {
    code: 'P5',
    name: 'Exit Positioning',
    tactics: ['Appoint M&A advisor by Month 18', 'Commission commercial due diligence prep pack', 'Normalise EBITDA to £5–7m run-rate', 'Build 5-year model for buyer IM'],
    people: ['M&A advisor (Month 18)', 'CFO (financial model)', 'CEO (process leadership)'],
    process: ['Board reporting (exit readiness)', 'Data room preparation', 'Normalised EBITDA reporting'],
    kpis: [{ label: 'EBITDA run-rate (£m)', status: 'R' as RAG }, { label: 'Exit readiness score', status: 'A' as RAG }],
    ceoLever: 'Appoint M&A advisor by Month 18; target 8–10× EBITDA exit in Month 24–30',
  },
];

const RAG_COLOUR: Record<RAG, string> = { R: '#B84A2E', A: '#8B6914', G: '#1A4A3A' };
const NEXT_RAG: Record<RAG, RAG> = { R: 'A', A: 'G', G: 'R' };

const ROW_ROWS = ['TACTICS', 'PEOPLE', 'PROCESS &\nSYSTEMS', 'KPIS'] as const;

async function saveSetting(key: string, value: string) {
  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
}

export default function StrategyPillars({
  initialGoal = 'Restore Designers Guild to sustained profitability and position for a premium exit at 8–10× EBITDA in 24–30 months.',
  initialStrategy = 'Close the £7–9m EBITDA gap through five interlocked workstreams: trade account recovery, pricing discipline, structural cost reduction, US channel expansion, and investor-ready exit preparation.',
}: {
  initialGoal?: string;
  initialStrategy?: string;
}) {
  const [goal, setGoal] = useState(initialGoal);
  const [strategy, setStrategy] = useState(initialStrategy);
  const [pillars, setPillars] = useState(PILLARS);

  const cycleRAG = (pi: number, ki: number) => {
    setPillars(prev => prev.map((p, i) =>
      i !== pi ? p : {
        ...p,
        kpis: p.kpis.map((k, j) => j !== ki ? k : { ...k, status: NEXT_RAG[k.status] }),
      }
    ));
  };

  const GRID: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '80px repeat(5, 1fr)',
    gap: 0,
  };

  return (
    <div style={{ padding: 28, fontFamily: 'var(--font-sans)' }}>
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1A1714' }}>Strategy Pillars</h1>
        <span style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: 3, background: BLUE_SOFT, color: BLUE,
          fontFamily: 'var(--font-mono)',
        }}>client</span>
      </div>

      {/* Zone 1 — Goal + Strategy */}
      <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Goal */}
        <div style={{ border: `1px solid #E2DDD6`, borderLeft: `3px solid ${BLUE}`, borderRadius: 6, padding: '12px 16px', background: '#FFFFFF' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#A09890', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Level 1 · Goal
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const v = e.currentTarget.textContent ?? goal;
              setGoal(v);
              saveSetting('pillar_goal', v);
            }}
            style={{ fontSize: 14, fontWeight: 600, color: BLUE, lineHeight: 1.5, outline: 'none', cursor: 'text' }}
          >
            {goal}
          </div>
        </div>

        {/* Strategy */}
        <div style={{ border: '1px solid #E2DDD6', borderRadius: 6, padding: '12px 16px', background: '#FFFFFF' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#A09890', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Level 2 · Strategy
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const v = e.currentTarget.textContent ?? strategy;
              setStrategy(v);
              saveSetting('pillar_strategy', v);
            }}
            style={{ fontSize: 13, fontWeight: 400, color: '#1A1714', lineHeight: 1.6, outline: 'none', cursor: 'text' }}
          >
            {strategy}
          </div>
        </div>
      </div>

      {/* Zone 2 — Matrix */}
      <div style={{ marginBottom: 20, border: '1px solid #E2DDD6', borderRadius: 6, overflow: 'hidden', background: '#FFFFFF' }}>
        {/* Pillars header label */}
        <div style={{ textAlign: 'center', padding: '10px 0 6px', borderBottom: '1px solid #E2DDD6' }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#A09890', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Level 3 · Pillars
          </span>
        </div>

        {/* Column headers */}
        <div style={{ ...GRID, borderBottom: '2px solid #E2DDD6' }}>
          {/* Empty row-label cell */}
          <div style={{ borderRight: '1px solid #E2DDD6', background: '#F7F5F2' }} />
          {pillars.map((p, i) => (
            <div key={p.code} style={{
              padding: '10px 12px',
              borderRight: i < 4 ? '1px solid #E2DDD6' : undefined,
              borderBottom: `2px solid ${BLUE}`,
            }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: BLUE, letterSpacing: '0.06em', marginBottom: 4 }}>{p.code}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1714', lineHeight: 1.3 }}>{p.name}</div>
            </div>
          ))}
        </div>

        {/* TACTICS row */}
        <MatrixRow label="TACTICS" borderRight="1px solid #E2DDD6">
          {pillars.map((p, i) => (
            <div key={p.code} style={{ padding: '10px 12px', borderRight: i < 4 ? '1px solid #E2DDD6' : undefined, borderBottom: '1px solid #F0EDE8' }}>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {p.tactics.map((t, ti) => (
                  <li key={ti} style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.4, display: 'flex', gap: 5 }}>
                    <span style={{ color: BLUE, flexShrink: 0, marginTop: 1 }}>·</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </MatrixRow>

        {/* PEOPLE row */}
        <MatrixRow label="PEOPLE" borderRight="1px solid #E2DDD6">
          {pillars.map((p, i) => (
            <div key={p.code} style={{ padding: '10px 12px', borderRight: i < 4 ? '1px solid #E2DDD6' : undefined, borderBottom: '1px solid #F0EDE8' }}>
              {p.people.map((person, pi) => (
                <div key={pi} style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.5 }}>{person}</div>
              ))}
            </div>
          ))}
        </MatrixRow>

        {/* PROCESS & SYSTEMS row */}
        <MatrixRow label={'PROCESS &\nSYSTEMS'} borderRight="1px solid #E2DDD6">
          {pillars.map((p, i) => (
            <div key={p.code} style={{ padding: '10px 12px', borderRight: i < 4 ? '1px solid #E2DDD6' : undefined, borderBottom: '1px solid #F0EDE8' }}>
              {p.process.map((proc, pri) => (
                <div key={pri} style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.5 }}>{proc}</div>
              ))}
            </div>
          ))}
        </MatrixRow>

        {/* KPIS row */}
        <MatrixRow label="KPIS" borderRight="1px solid #E2DDD6" last>
          {pillars.map((p, i) => (
            <div key={p.code} style={{ padding: '10px 12px', borderRight: i < 4 ? '1px solid #E2DDD6' : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.kpis.map((kpi, ki) => (
                <button
                  key={ki}
                  onClick={() => cycleRAG(i, ki)}
                  title="Click to cycle R→A→G"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: RAG_COLOUR[kpi.status], flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.4 }}>{kpi.label}</span>
                </button>
              ))}
            </div>
          ))}
        </MatrixRow>
      </div>

      {/* Zone 3 — CEO Levers */}
      <div style={{ borderTop: `2px solid ${BLUE}`, paddingTop: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          CEO Levers
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {pillars.map((p, i) => (
            <div key={i} style={{
              border: `1px dashed ${BLUE}`,
              borderRadius: 6,
              padding: '10px 12px',
              background: BLUE_SOFT,
            }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: BLUE, letterSpacing: '0.06em', marginBottom: 5 }}>{p.code}</div>
              <div style={{ fontSize: 11, color: BLUE, lineHeight: 1.5 }}>{p.ceoLever}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid #E2DDD6',
      }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#A09890', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Confidential · May 2026
        </span>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#A09890', letterSpacing: '0.06em' }}>
          15/31
        </span>
      </div>
    </div>
  );
}

function MatrixRow({
  label, children, borderRight, last,
}: {
  label: string;
  children: React.ReactNode;
  borderRight?: string;
  last?: boolean;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px repeat(5, 1fr)',
      borderBottom: last ? undefined : '1px solid #E2DDD6',
    }}>
      {/* Row label */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '10px 6px',
        borderRight,
        background: '#F7F5F2',
      }}>
        <span style={{
          fontSize: 8, fontFamily: 'var(--font-mono)', color: '#A09890',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.4,
        }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
