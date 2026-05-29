'use client';

import { useState, useMemo } from 'react';
import type { Recommendation, Cashflow } from '@/types/union';

const QUARTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const Q_LABELS = ['Q1 Y1', 'Q2 Y1', 'Q3 Y1', 'Q4 Y1', 'Q1 Y2', 'Q2 Y2', 'Q3 Y2', 'Q4 Y2'];

const fmt = (n: number, decimals = 1) =>
  (n >= 0 ? '+' : '') + '£' + Math.abs(n).toFixed(decimals) + 'm';

interface Props {
  initialRecs: Recommendation[];
  initialCashflow: Cashflow[];
}

export default function TwoYearPlan({ initialRecs, initialCashflow }: Props) {
  const [recs] = useState<Recommendation[]>(initialRecs);
  const [cashflow, setCashflow] = useState<Cashflow[]>(initialCashflow);

  const approved = useMemo(() => recs.filter(r => r.approved), [recs]);

  const getCf = (recId: string, quarter: number): Cashflow | undefined =>
    cashflow.find(c => c.rec_id === recId && c.quarter === quarter);

  const updateCf = async (id: string, field: 'cost_out' | 'saving_in', value: number) => {
    setCashflow(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    await fetch('/api/cashflow', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: value }),
    });
  };

  // Summary calculations
  const quarterTotals = useMemo(() => QUARTERS.map(q => {
    const approvedCf = cashflow.filter(c =>
      c.quarter === q && approved.some(r => r.id === c.rec_id)
    );
    const costOut = approvedCf.reduce((s, c) => s + Number(c.cost_out), 0);
    const savingIn = approvedCf.reduce((s, c) => s + Number(c.saving_in), 0);
    return { q, costOut, savingIn, net: savingIn - costOut };
  }), [cashflow, approved]);

  const cumulative = useMemo(() => {
    let cum = 0;
    return quarterTotals.map(t => { cum += t.net; return cum; });
  }, [quarterTotals]);

  // Horizon summaries (0-6mo = Q1-Q2, 6-18mo = Q3-Q6, 18-24mo = Q7-Q8)
  const horizonSummary = useMemo(() => {
    const h1 = quarterTotals.slice(0, 2);
    const h2 = quarterTotals.slice(2, 6);
    const h3 = quarterTotals.slice(6, 8);
    const sum = (arr: typeof quarterTotals) => ({
      costOut: arr.reduce((s, t) => s + t.costOut, 0),
      savingIn: arr.reduce((s, t) => s + t.savingIn, 0),
      net: arr.reduce((s, t) => s + t.net, 0),
    });
    return [sum(h1), sum(h2), sum(h3)];
  }, [quarterTotals]);

  const HORIZON_LABELS = ['0–6 months', '6–18 months', '18–24 months'];

  const maxBar = Math.max(...quarterTotals.map(t => Math.abs(t.net)), 0.01);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          2-Year Plan
        </h1>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: 3,
          background: 'var(--color-gold-soft)', color: 'var(--color-gold)',
          fontFamily: 'var(--font-mono)',
        }}>client</span>
      </div>

      {/* Horizon summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {horizonSummary.map((h, i) => (
          <div key={i} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 10, padding: '18px 20px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {HORIZON_LABELS[i]}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <HorizonStat label="Cash out" value={`-£${h.costOut.toFixed(1)}m`} colour="var(--color-coral)" />
              <HorizonStat label="Savings in" value={`+£${h.savingIn.toFixed(1)}m`} colour="var(--color-accent)" />
              <HorizonStat label="Net" value={fmt(h.net)} colour={h.net >= 0 ? 'var(--color-accent)' : 'var(--color-coral)'} />
            </div>
          </div>
        ))}
      </div>

      {/* EBITDA waterfall */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '20px 24px', marginBottom: 28,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--color-text-primary)' }}>
          EBITDA Impact Waterfall — Approved Recommendations
        </h2>
        {approved.length === 0 ? (
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            No approved recommendations. Toggle approvals in the Recommendations module.
          </div>
        ) : (
          <WaterfallChart recs={approved} cashflow={cashflow} />
        )}
      </div>

      {/* Cashflow table */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 10, overflow: 'hidden', marginBottom: 28,
      }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-2)',
          fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
        }}>
          Quarterly Cashflow Detail
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                <th style={{ ...thStyle, textAlign: 'left', width: 220 }}>Recommendation</th>
                <th style={{ ...thStyle, width: 70 }}>Type</th>
                {Q_LABELS.map(l => (
                  <th key={l} style={thStyle}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Cost rows */}
              <tr>
                <td colSpan={10} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', background: 'var(--color-surface-2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Implementation costs
                </td>
              </tr>
              {approved.map(rec => {
                const hasCosts = QUARTERS.some(q => (getCf(rec.id, q)?.cost_out ?? 0) > 0);
                if (!hasCosts) return null;
                return (
                  <tr key={`cost-${rec.id}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>{rec.title}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 3, background: 'var(--color-coral-soft)', color: 'var(--color-coral)', fontWeight: 600 }}>cost</span>
                    </td>
                    {QUARTERS.map(q => {
                      const cf = getCf(rec.id, q);
                      const val = cf?.cost_out ?? 0;
                      return (
                        <td key={q} style={{ padding: '4px 4px', textAlign: 'center' }}>
                          <CashCell
                            value={val}
                            onChange={v => cf && updateCf(cf.id, 'cost_out', v)}
                            colour={val > 0 ? 'var(--color-coral)' : 'var(--color-text-tertiary)'}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Savings rows */}
              <tr>
                <td colSpan={10} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', background: 'var(--color-surface-2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Savings / revenue uplift
                </td>
              </tr>
              {approved.map(rec => {
                const hasSavings = QUARTERS.some(q => (getCf(rec.id, q)?.saving_in ?? 0) > 0);
                if (!hasSavings) return null;
                return (
                  <tr key={`save-${rec.id}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>{rec.title}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 3, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', fontWeight: 600 }}>saving</span>
                    </td>
                    {QUARTERS.map(q => {
                      const cf = getCf(rec.id, q);
                      const val = cf?.saving_in ?? 0;
                      return (
                        <td key={q} style={{ padding: '4px 4px', textAlign: 'center' }}>
                          <CashCell
                            value={val}
                            onChange={v => cf && updateCf(cf.id, 'saving_in', v)}
                            colour={val > 0 ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Totals */}
              <tr style={{ background: 'var(--color-surface-2)', fontWeight: 700 }}>
                <td style={{ padding: '10px 16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>Total costs</td>
                <td />
                {quarterTotals.map(t => (
                  <td key={t.q} style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--color-coral)' }}>
                    {t.costOut > 0 ? `-£${t.costOut.toFixed(2)}m` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ background: 'var(--color-surface-2)', fontWeight: 700 }}>
                <td style={{ padding: '10px 16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>Total savings</td>
                <td />
                {quarterTotals.map(t => (
                  <td key={t.q} style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--color-accent)' }}>
                    {t.savingIn > 0 ? `+£${t.savingIn.toFixed(2)}m` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderTop: '2px solid var(--color-border)', fontWeight: 700 }}>
                <td style={{ padding: '10px 16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>Net quarterly</td>
                <td />
                {quarterTotals.map(t => (
                  <td key={t.q} style={{ padding: '10px 8px', textAlign: 'center', color: t.net >= 0 ? 'var(--color-accent)' : 'var(--color-coral)' }}>
                    {fmt(t.net)}
                  </td>
                ))}
              </tr>
              <tr style={{ background: 'var(--color-accent-soft)', fontWeight: 700 }}>
                <td style={{ padding: '10px 16px', color: 'var(--color-accent)', fontFamily: 'var(--font-sans)' }}>Cumulative</td>
                <td />
                {cumulative.map((c, i) => (
                  <td key={i} style={{ padding: '10px 8px', textAlign: 'center', color: c >= 0 ? 'var(--color-accent)' : 'var(--color-coral)', fontFamily: 'var(--font-mono)' }}>
                    {fmt(c)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net quarterly bar chart */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '20px 24px',
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--color-text-primary)' }}>
          Net Quarterly Cash Position
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
          {quarterTotals.map((t, i) => {
            const barH = Math.abs(t.net) / maxBar * 100;
            const pos = t.net >= 0;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {pos ? (
                  <>
                    <div style={{
                      width: '100%', height: `${barH}%`,
                      background: 'var(--color-accent)', borderRadius: '4px 4px 0 0',
                      minHeight: 2,
                    }} />
                    <div style={{ height: 0 }} />
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }} />
                    <div style={{
                      width: '100%', height: `${barH}%`,
                      background: 'var(--color-coral)', borderRadius: '0 0 4px 4px',
                      minHeight: 2,
                    }} />
                  </>
                )}
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {Q_LABELS[i]}
                </div>
                <div style={{ fontSize: 10, color: pos ? 'var(--color-accent)' : 'var(--color-coral)', fontFamily: 'var(--font-mono)' }}>
                  {t.net === 0 ? '—' : fmt(t.net, 2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HorizonStat({ label, value, colour }: { label: string; value: string; colour: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: colour, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}

function CashCell({ value, onChange, colour }: { value: number; onChange: (v: number) => void; colour: string }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value.toString());

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        step="0.01"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => {
          setEditing(false);
          const v = parseFloat(local);
          if (!isNaN(v)) onChange(v);
        }}
        style={{
          width: 64, textAlign: 'center', border: '1px solid var(--color-accent)',
          borderRadius: 4, padding: '2px 4px', fontSize: 12, fontFamily: 'var(--font-mono)',
          outline: 'none',
        }}
      />
    );
  }

  return (
    <button
      onClick={() => { setLocal(value.toString()); setEditing(true); }}
      style={{
        background: 'none', border: '1px solid transparent', borderRadius: 4,
        padding: '2px 4px', cursor: 'pointer', fontSize: 12,
        fontFamily: 'var(--font-mono)', color: value === 0 ? 'var(--color-text-tertiary)' : colour,
        minWidth: 56, textAlign: 'center',
      }}
    >
      {value === 0 ? '—' : `£${value.toFixed(2)}m`}
    </button>
  );
}

function WaterfallChart({ recs, cashflow }: { recs: Recommendation[]; cashflow: Cashflow[] }) {
  const baseline = -2.0;
  const data = recs.map(r => {
    const totalSaving = cashflow
      .filter(c => c.rec_id === r.id)
      .reduce((s, c) => s + Number(c.saving_in) - Number(c.cost_out), 0);
    return { label: r.title, value: totalSaving };
  });

  const exit = baseline + data.reduce((s, d) => s + d.value, 0);
  const maxAbs = Math.max(Math.abs(baseline), Math.abs(exit), ...data.map(d => Math.abs(d.value)));

  const BAR_WIDTH = Math.floor(680 / (data.length + 2));
  const HEIGHT = 160;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: HEIGHT + 60 }}>
      {/* Baseline */}
      <WBar label="Baseline" value={baseline} maxAbs={maxAbs} height={HEIGHT} width={BAR_WIDTH} colour="var(--color-text-tertiary)" />
      {/* Each rec */}
      {data.map((d, i) => (
        <WBar key={i} label={recs[i].title.split(' ')[0]} value={d.value} maxAbs={maxAbs} height={HEIGHT} width={BAR_WIDTH}
          colour={d.value >= 0 ? 'var(--color-accent)' : 'var(--color-coral)'} />
      ))}
      {/* Exit EBITDA */}
      <WBar label="Exit EBITDA" value={exit} maxAbs={maxAbs} height={HEIGHT} width={BAR_WIDTH}
        colour={exit >= 0 ? 'var(--color-accent)' : 'var(--color-coral)'} />
    </div>
  );
}

function WBar({ label, value, maxAbs, height, width, colour }: {
  label: string; value: number; maxAbs: number; height: number; width: number; colour: string;
}) {
  const barH = Math.max(Math.abs(value) / maxAbs * height, 4);
  const isNeg = value < 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: colour, fontWeight: 600 }}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}m
      </div>
      <div style={{ height, display: 'flex', alignItems: isNeg ? 'flex-start' : 'flex-end' }}>
        <div style={{
          width: width - 8,
          height: barH,
          background: colour,
          borderRadius: isNeg ? '0 0 4px 4px' : '4px 4px 0 0',
          opacity: 0.85,
        }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  textAlign: 'center',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
};
