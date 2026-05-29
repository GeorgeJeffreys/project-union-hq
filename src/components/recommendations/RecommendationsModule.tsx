'use client';

import { useState } from 'react';
import type { Recommendation, Cashflow, Horizons } from '@/types/union';

const PILLAR_COLOURS: Record<string, { bg: string; text: string }> = {
  'Revenue Growth': { bg: 'var(--color-accent-soft)', text: 'var(--color-accent)' },
  'Cost Efficiency': { bg: 'var(--color-gold-soft)', text: 'var(--color-gold)' },
  'Channel Expansion': { bg: 'var(--color-blue-soft)', text: 'var(--color-blue)' },
  'Operational Excellence': { bg: 'var(--color-surface-2)', text: 'var(--color-text-secondary)' },
  'Exit Readiness': { bg: 'var(--color-coral-soft)', text: 'var(--color-coral)' },
};

const fmtM = (n: number | null) => n == null ? '—' : `£${n.toFixed(1)}m`;

interface Props {
  initialRecs: Recommendation[];
  initialCashflow: Cashflow[];
}

export default function RecommendationsModule({ initialRecs, initialCashflow }: Props) {
  const [recs, setRecs] = useState<Recommendation[]>(initialRecs);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const revenueRecs = recs.filter(r =>
    ['Revenue Growth', 'Channel Expansion'].includes(r.pillar ?? '')
  );
  const costRecs = recs.filter(r =>
    !['Revenue Growth', 'Channel Expansion'].includes(r.pillar ?? '')
  );

  const toggle = async (rec: Recommendation) => {
    const next = !rec.approved;
    setRecs(prev => prev.map(r => r.id === rec.id ? { ...r, approved: next } : r));
    await fetch('/api/recommendations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rec.id, approved: next }),
    });
  };

  const saveHorizons = async (rec: Recommendation, horizons: Horizons) => {
    setRecs(prev => prev.map(r => r.id === rec.id ? { ...r, horizons } : r));
    await fetch('/api/recommendations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rec.id, horizons }),
    });
  };

  const addRec = async (form: Omit<Recommendation, 'id' | 'created_at'>) => {
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const newRec = await res.json();
    setRecs(prev => [...prev, newRec]);
    setShowAddModal(false);
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Recommendations
          </h1>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 3,
            background: 'var(--color-gold-soft)', color: 'var(--color-gold)',
            fontFamily: 'var(--font-mono)',
          }}>client</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'var(--color-accent)', color: '#fff', border: 'none',
            borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Add Recommendation
        </button>
      </div>

      {/* Summary row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28,
      }}>
        <SummaryCard label="Total approved" value={recs.filter(r => r.approved).length.toString()} unit="recs" colour="var(--color-accent)" />
        <SummaryCard
          label="Upside impact"
          value={`£${recs.filter(r => r.approved).reduce((s, r) => s + (r.impact_high ?? 0), 0).toFixed(1)}m`}
          unit="(high case)"
          colour="var(--color-accent)"
        />
        <SummaryCard
          label="Low-case impact"
          value={`£${recs.filter(r => r.approved).reduce((s, r) => s + (r.impact_low ?? 0), 0).toFixed(1)}m`}
          unit="(low case)"
          colour="var(--color-gold)"
        />
      </div>

      <Section
        title="Increase Revenue"
        recs={revenueRecs}
        expanded={expanded}
        onToggle={(id) => setExpanded(e => e === id ? null : id)}
        onApprove={toggle}
        onSaveHorizons={saveHorizons}
      />

      <Section
        title="Reduce Costs"
        recs={costRecs}
        expanded={expanded}
        onToggle={(id) => setExpanded(e => e === id ? null : id)}
        onApprove={toggle}
        onSaveHorizons={saveHorizons}
        style={{ marginTop: 24 }}
      />

      {showAddModal && <AddRecModal onClose={() => setShowAddModal(false)} onSave={addRec} />}
    </div>
  );
}

function SummaryCard({ label, value, unit, colour }: { label: string; value: string; unit: string; colour: string }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 10, padding: '16px 20px',
    }}>
      <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: colour, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{unit}</div>
    </div>
  );
}

function Section({
  title, recs, expanded, onToggle, onApprove, onSaveHorizons, style: extStyle,
}: {
  title: string;
  recs: Recommendation[];
  expanded: string | null;
  onToggle: (id: string) => void;
  onApprove: (rec: Recommendation) => void;
  onSaveHorizons: (rec: Recommendation, h: Horizons) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div style={extStyle}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>
        {title}
      </h2>
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '44px 1fr 100px 100px 120px 120px 36px',
          padding: '10px 16px', borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-2)',
          fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase',
          gap: 8,
        }}>
          <div></div>
          <div>Title</div>
          <div>Pillar</div>
          <div>Node</div>
          <div>Impact range</div>
          <div>EBITDA effect</div>
          <div></div>
        </div>
        {recs.map((rec, i) => (
          <RecRow
            key={rec.id}
            rec={rec}
            isLast={i === recs.length - 1}
            isExpanded={expanded === rec.id}
            onToggle={() => onToggle(rec.id)}
            onApprove={() => onApprove(rec)}
            onSaveHorizons={(h) => onSaveHorizons(rec, h)}
          />
        ))}
        {recs.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            No recommendations yet
          </div>
        )}
      </div>
    </div>
  );
}

function RecRow({
  rec, isLast, isExpanded, onToggle, onApprove, onSaveHorizons,
}: {
  rec: Recommendation;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onSaveHorizons: (h: Horizons) => void;
}) {
  const pillarStyle = PILLAR_COLOURS[rec.pillar ?? ''] ?? { bg: 'var(--color-surface-2)', text: 'var(--color-text-secondary)' };
  const total = ((rec.impact_low ?? 0) + (rec.impact_high ?? 0)) / 2;

  return (
    <>
      <div style={{
        borderBottom: isLast && !isExpanded ? 'none' : '1px solid var(--color-border)',
        display: 'grid',
        gridTemplateColumns: '44px 1fr 100px 100px 120px 120px 36px',
        padding: '12px 16px',
        alignItems: 'center',
        gap: 8,
        background: rec.approved ? 'var(--color-accent-soft)' : 'var(--color-surface)',
      }}>
        {/* Toggle */}
        <button
          onClick={onApprove}
          title={rec.approved ? 'Remove approval' : 'Approve'}
          style={{
            width: 28, height: 28, borderRadius: 6,
            border: `2px solid ${rec.approved ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: rec.approved ? 'var(--color-accent)' : 'transparent',
            color: rec.approved ? '#fff' : 'var(--color-text-tertiary)',
            fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {rec.approved ? '✓' : ''}
        </button>
        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {rec.title}
        </div>
        {/* Pillar badge */}
        <div style={{
          fontSize: 10, fontWeight: 600, padding: '3px 6px', borderRadius: 4,
          background: pillarStyle.bg, color: pillarStyle.text,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {rec.pillar ?? '—'}
        </div>
        {/* Node */}
        <div style={{
          fontSize: 10, fontWeight: 500, padding: '3px 6px', borderRadius: 4,
          background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-mono)',
        }}>
          {rec.tree_node ?? '—'}
        </div>
        {/* Impact range */}
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
          {fmtM(rec.impact_low)}–{fmtM(rec.impact_high)}
        </div>
        {/* EBITDA contribution */}
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
          {total > 0 ? `+£${total.toFixed(1)}m` : '—'}
        </div>
        {/* Expand chevron */}
        <button
          onClick={onToggle}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-tertiary)', fontSize: 16, padding: 4,
            transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s',
          }}
        >
          ›
        </button>
      </div>

      {/* Expanded horizon plan */}
      {isExpanded && (
        <HorizonDetail
          rec={rec}
          isLast={isLast}
          onSave={onSaveHorizons}
        />
      )}
    </>
  );
}

function HorizonDetail({
  rec, isLast, onSave,
}: {
  rec: Recommendation;
  isLast: boolean;
  onSave: (h: Horizons) => void;
}) {
  const [h, setH] = useState<Horizons>(rec.horizons ?? {
    h0_3: { actions: '', owner: '' },
    h3_12: { actions: '', owner: '' },
    h12_24: { actions: '', owner: '' },
  });

  const HORIZONS: Array<{ key: keyof Horizons; label: string; colour: string }> = [
    { key: 'h0_3',   label: '0–3 months',   colour: 'var(--color-coral)' },
    { key: 'h3_12',  label: '3–12 months',  colour: 'var(--color-gold)' },
    { key: 'h12_24', label: '12–24 months', colour: 'var(--color-accent)' },
  ];

  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      background: 'var(--color-surface-2)',
      padding: '16px 16px 16px 60px',
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
    }}>
      {HORIZONS.map(({ key, label, colour }) => (
        <div key={key}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colour, marginBottom: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {label}
          </div>
          <textarea
            value={h[key].actions}
            onChange={e => setH(prev => ({ ...prev, [key]: { ...prev[key], actions: e.target.value } }))}
            onBlur={() => onSave(h)}
            placeholder="Actions…"
            rows={3}
            style={{
              width: '100%', resize: 'none', border: '1px solid var(--color-border)', borderRadius: 6,
              padding: '6px 8px', fontSize: 12, background: 'var(--color-surface)',
              color: 'var(--color-text-primary)', outline: 'none', marginBottom: 6,
            }}
          />
          <input
            value={h[key].owner}
            onChange={e => setH(prev => ({ ...prev, [key]: { ...prev[key], owner: e.target.value } }))}
            onBlur={() => onSave(h)}
            placeholder="Owner"
            style={{
              width: '100%', border: '1px solid var(--color-border)', borderRadius: 6,
              padding: '4px 8px', fontSize: 12, background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)', outline: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function AddRecModal({ onClose, onSave }: { onClose: () => void; onSave: (f: Omit<Recommendation, 'id' | 'created_at'>) => void }) {
  const [form, setForm] = useState({
    title: '', pillar: 'Revenue Growth', tree_node: '', impact_low: '', impact_high: '',
    approved: false,
    horizons: {
      h0_3: { actions: '', owner: '' },
      h3_12: { actions: '', owner: '' },
      h12_24: { actions: '', owner: '' },
    } as Horizons,
  });

  const submit = () => {
    if (!form.title) return;
    onSave({
      title: form.title,
      pillar: form.pillar || null,
      tree_node: form.tree_node || null,
      impact_low: form.impact_low ? parseFloat(form.impact_low) : null,
      impact_high: form.impact_high ? parseFloat(form.impact_high) : null,
      approved: form.approved,
      horizons: form.horizons,
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: 'var(--color-surface)', borderRadius: 12, padding: 28, width: 560,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>Add Recommendation</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Title" required>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={inputStyle} placeholder="Recommendation title" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Pillar">
              <select value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))} style={inputStyle}>
                {Object.keys(PILLAR_COLOURS).map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Tree node">
              <input value={form.tree_node} onChange={e => setForm(f => ({ ...f, tree_node: e.target.value }))}
                style={inputStyle} placeholder="e.g. Property" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Impact low (£m)">
              <input type="number" step="0.1" value={form.impact_low}
                onChange={e => setForm(f => ({ ...f, impact_low: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Impact high (£m)">
              <input type="number" step="0.1" value={form.impact_high}
                onChange={e => setForm(f => ({ ...f, impact_high: e.target.value }))} style={inputStyle} />
            </Field>
          </div>
          {(['h0_3', 'h3_12', 'h12_24'] as const).map(k => (
            <div key={k}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                {k === 'h0_3' ? '0–3 months' : k === 'h3_12' ? '3–12 months' : '12–24 months'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8 }}>
                <input placeholder="Actions"
                  value={form.horizons[k].actions}
                  onChange={e => setForm(f => ({ ...f, horizons: { ...f.horizons, [k]: { ...f.horizons[k], actions: e.target.value } } }))}
                  style={inputStyle} />
                <input placeholder="Owner"
                  value={form.horizons[k].owner}
                  onChange={e => setForm(f => ({ ...f, horizons: { ...f.horizons, [k]: { ...f.horizons[k], owner: e.target.value } } }))}
                  style={inputStyle} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...btnStyle, background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>Cancel</button>
          <button onClick={submit} style={{ ...btnStyle, background: 'var(--color-accent)', color: '#fff' }}>Add</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid var(--color-border)', borderRadius: 7,
  padding: '8px 10px', fontSize: 13, background: 'var(--color-surface-2)',
  color: 'var(--color-text-primary)', outline: 'none',
};

const btnStyle: React.CSSProperties = {
  border: 'none', borderRadius: 7, padding: '8px 18px',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
