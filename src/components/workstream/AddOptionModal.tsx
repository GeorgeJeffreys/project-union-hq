'use client';

import { useState } from 'react';
import { Option, Workstream, Stage } from '@/types/union';

interface AddOptionModalProps {
  onClose: () => void;
  onAdded: (option: Option) => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 13,
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  fontFamily: 'inherit',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
  marginBottom: 5,
  fontFamily: 'var(--font-mono)',
};

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  appearance: 'none',
  cursor: 'pointer',
};

export default function AddOptionModal({ onClose, onAdded }: AddOptionModalProps) {
  const [form, setForm] = useState({
    workstream: 'revenue' as Workstream,
    stage: 'could' as Stage,
    title: '',
    description: '',
    impact_low: '',
    impact_high: '',
    cash_cost: '',
    tree_node: '',
    rationale: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        workstream: form.workstream,
        stage: form.stage,
        title: form.title.trim(),
        description: form.description.trim() || null,
        impact_low: form.impact_low !== '' ? parseFloat(form.impact_low) : null,
        impact_high: form.impact_high !== '' ? parseFloat(form.impact_high) : null,
        cash_cost: form.cash_cost !== '' ? parseFloat(form.cash_cost) : null,
        tree_node: form.tree_node.trim() || null,
        rationale: form.rationale.trim() || null,
      };
      const res = await fetch('/api/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save option.');
      const created: Option = await res.json();
      onAdded(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(26,23,20,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          width: 540,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 40px rgba(26,23,20,0.12)',
          padding: '28px 32px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>Add Option</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Add a new revenue or cost option to the workstream
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: workstream + stage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={LABEL_STYLE}>Workstream</label>
              <select
                value={form.workstream}
                onChange={e => set('workstream', e.target.value)}
                style={SELECT_STYLE}
              >
                <option value="revenue">Revenue</option>
                <option value="cost">Cost</option>
              </select>
            </div>
            <div>
              <label style={LABEL_STYLE}>Stage</label>
              <select
                value={form.stage}
                onChange={e => set('stage', e.target.value)}
                style={SELECT_STYLE}
              >
                <option value="could">Could</option>
                <option value="can">Can</option>
                <option value="should">Should</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_STYLE}>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Increase trade pricing by 5%"
              style={INPUT_STYLE}
              autoFocus
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_STYLE}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Short description of the option..."
              rows={2}
              style={{ ...INPUT_STYLE, resize: 'vertical' }}
            />
          </div>

          {/* Impact row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={LABEL_STYLE}>Impact Low (£m)</label>
              <input
                type="number"
                step="0.1"
                value={form.impact_low}
                onChange={e => set('impact_low', e.target.value)}
                placeholder="0.0"
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Impact High (£m)</label>
              <input
                type="number"
                step="0.1"
                value={form.impact_high}
                onChange={e => set('impact_high', e.target.value)}
                placeholder="0.0"
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Cash Cost (£m)</label>
              <input
                type="number"
                step="0.1"
                value={form.cash_cost}
                onChange={e => set('cash_cost', e.target.value)}
                placeholder="0.0"
                style={INPUT_STYLE}
              />
            </div>
          </div>

          {/* Tree node */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_STYLE}>Tree Node</label>
            <input
              type="text"
              value={form.tree_node}
              onChange={e => set('tree_node', e.target.value)}
              placeholder="e.g. REV.1.2"
              style={INPUT_STYLE}
            />
          </div>

          {/* Rationale */}
          <div style={{ marginBottom: 24 }}>
            <label style={LABEL_STYLE}>Rationale</label>
            <textarea
              value={form.rationale}
              onChange={e => set('rationale', e.target.value)}
              placeholder="Why is this option worth pursuing?..."
              rows={3}
              style={{ ...INPUT_STYLE, resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 16, padding: '8px 12px',
              background: 'var(--color-coral-soft)',
              border: '1px solid var(--color-coral)',
              borderRadius: 6, fontSize: 13,
              color: 'var(--color-coral)',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 36, padding: '0 16px',
                fontSize: 13, fontWeight: 500,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 7, color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                height: 36, padding: '0 20px',
                fontSize: 13, fontWeight: 600,
                background: saving ? 'var(--color-accent-soft)' : 'var(--color-accent)',
                border: 'none',
                borderRadius: 7, color: saving ? 'var(--color-accent)' : '#fff',
                cursor: saving ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {saving ? 'Adding…' : 'Add Option'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
