'use client';

import { useState, useCallback, useRef } from 'react';
import { Scenario, ScenarioInputs } from '@/types/union';

interface ScenarioModellerProps {
  initialScenarios: Scenario[];
}

// ─── Formatting helpers ────────────────────────────────────────────────────────

function fmtMoney(v: number | undefined): string {
  if (v == null || isNaN(v)) return '—';
  return `£${v.toFixed(1)}m`;
}

function fmtPct(v: number | undefined): string {
  if (v == null || isNaN(v)) return '—';
  return `${v.toFixed(1)}%`;
}

// ─── EBITDA calculator ────────────────────────────────────────────────────────

function n(v: unknown): number {
  const x = Number(v);
  return isNaN(x) ? 0 : x;
}

function calcEBITDA(inp: ScenarioInputs): number {
  const revenue_total =
    (n(inp.trade_revenue) + n(inp.us_revenue) + n(inp.dtc_revenue)) *
    (1 + n(inp.avg_price_uplift_pct) / 100);
  const gross_profit = revenue_total * (n(inp.gross_margin_pct) / 100);
  const total_overhead =
    n(inp.property) + n(inp.headcount) + n(inp.marketing) + n(inp.other_overhead);
  return gross_profit - total_overhead;
}

// ─── Row definitions ──────────────────────────────────────────────────────────

type InputKey = keyof ScenarioInputs;

type RowConfig =
  | { kind: 'input'; key: InputKey; label: string; isPct: boolean }
  | { kind: 'separator' }
  | { kind: 'derived'; id: 'ebitda'; label: string }
  | { kind: 'derived'; id: 'cash_cost'; label: string };

const ROWS: RowConfig[] = [
  { kind: 'input', key: 'trade_revenue', label: 'Trade revenue', isPct: false },
  { kind: 'input', key: 'us_revenue', label: 'US revenue', isPct: false },
  { kind: 'input', key: 'dtc_revenue', label: 'DTC revenue', isPct: false },
  { kind: 'input', key: 'avg_price_uplift_pct', label: 'Avg price uplift %', isPct: true },
  { kind: 'input', key: 'gross_margin_pct', label: 'Gross margin %', isPct: true },
  { kind: 'input', key: 'property', label: 'Property', isPct: false },
  { kind: 'input', key: 'headcount', label: 'Headcount', isPct: false },
  { kind: 'input', key: 'marketing', label: 'Marketing', isPct: false },
  { kind: 'input', key: 'other_overhead', label: 'Other overhead', isPct: false },
  { kind: 'separator' },
  { kind: 'derived', id: 'ebitda', label: 'EBITDA' },
  { kind: 'derived', id: 'cash_cost', label: 'Cash cost of implementation' },
];

const INPUT_KEYS = ROWS.filter(
  (r): r is Extract<RowConfig, { kind: 'input' }> => r.kind === 'input'
).map(r => r.key);

// ─── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({
  value: rawValue,
  baseline: rawBaseline,
  isPct,
}: {
  value: number;
  baseline: number;
  isPct: boolean;
}) {
  const value = n(rawValue);
  const baseline = n(rawBaseline);
  const diff = value - baseline;
  if (Math.abs(diff) < 0.0001) return null;
  const positive = diff > 0;
  const pctChange = baseline !== 0 ? (diff / Math.abs(baseline)) * 100 : 0;
  const moneyStr = isPct ? `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}pp` : `${diff >= 0 ? '+' : ''}£${Math.abs(diff).toFixed(1)}m`;
  const sign = diff >= 0 ? '+' : '-';
  const pctStr = `${sign}${Math.abs(pctChange).toFixed(0)}%`;

  return (
    <div
      style={{
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color: positive ? 'var(--color-accent)' : 'var(--color-coral)',
        background: positive ? 'var(--color-accent-soft)' : 'var(--color-coral-soft)',
        borderRadius: 3,
        padding: '1px 5px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        marginTop: 2,
      }}
    >
      {moneyStr} | {pctStr}
    </div>
  );
}

// ─── Editable cell ────────────────────────────────────────────────────────────

function EditableCell({
  value: rawValue,
  baseline,
  isPct,
  onChange,
  isBaseline,
}: {
  value: number;
  baseline: number;
  isPct: boolean;
  onChange: (v: number) => void;
  isBaseline: boolean;
}) {
  const value = n(rawValue);
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = isPct ? fmtPct(value) : fmtMoney(value);

  function startEdit() {
    if (isBaseline) return;
    setRaw(value.toString());
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  }

  function commitEdit() {
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) onChange(parsed);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  }

  const cellStyle: React.CSSProperties = {
    padding: '10px 14px',
    minWidth: 130,
    borderRight: '1px solid var(--color-border)',
    verticalAlign: 'top',
    background: isBaseline ? 'var(--color-surface-2)' : 'var(--color-surface)',
    cursor: isBaseline ? 'default' : 'text',
    position: 'relative',
  };

  return (
    <td style={cellStyle} onClick={startEdit}>
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          step="0.1"
          value={raw}
          onChange={e => setRaw(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            border: 'none',
            borderBottom: '2px solid var(--color-accent)',
            background: 'transparent',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            outline: 'none',
            padding: '0',
          }}
          autoFocus
        />
      ) : (
        <div>
          <div
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: isBaseline ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            }}
          >
            {displayValue}
          </div>
          {!isBaseline && (
            <DeltaBadge value={value} baseline={baseline} isPct={isPct} />
          )}
        </div>
      )}
    </td>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScenarioModeller({ initialScenarios }: ScenarioModellerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const baseline = scenarios.find(s => s.is_baseline) ?? scenarios[0] ?? null;
  const nonBaseline = scenarios.filter(s => !s.is_baseline);

  const updateInput = useCallback(
    (scenarioId: string, key: InputKey, value: number) => {
      setScenarios(prev =>
        prev.map(s =>
          s.id === scenarioId
            ? { ...s, inputs: { ...s.inputs, [key]: value } }
            : s
        )
      );
    },
    []
  );

  const handleAddScenario = useCallback(async () => {
    if (!baseline) return;
    const name = window.prompt('Enter scenario name:');
    if (!name?.trim()) return;

    setAdding(true);
    try {
      const payload = {
        name: name.trim(),
        is_baseline: false,
        inputs: { ...baseline.inputs },
      };
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create scenario');
      const created: Scenario = await res.json();
      setScenarios(prev => [...prev, created]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create scenario');
    } finally {
      setAdding(false);
    }
  }, [baseline]);

  const handleSaveAll = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const payload = scenarios.map(s => ({ id: s.id, inputs: s.inputs }));
      const res = await fetch('/api/scenarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save scenarios');
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(null), 2000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [scenarios]);

  // Get the cash cost for a scenario: sum of all option cash costs is not available here,
  // so we show a dash (this field is informational / would require joining with options)
  function getDerivedValue(scenario: Scenario, id: 'ebitda' | 'cash_cost'): number | null {
    if (id === 'ebitda') return calcEBITDA(scenario.inputs);
    return null; // cash_cost would come from options data; not available here
  }

  const allScenarios = baseline ? [baseline, ...nonBaseline] : nonBaseline;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
      }}
    >
      {/* Page header */}
      <div
        style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Scenario Modeller
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                marginTop: 2,
              }}
            >
              Compare financial scenarios side-by-side
            </div>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 3,
              fontFamily: 'var(--font-mono)',
              background: 'var(--color-gold-soft)',
              color: 'var(--color-gold)',
              border: '1px solid var(--color-border)',
            }}
          >
            client
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveMsg && (
            <span
              style={{
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                color: saveMsg === 'Saved' ? 'var(--color-accent)' : 'var(--color-coral)',
              }}
            >
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleAddScenario}
            disabled={adding || !baseline}
            style={{
              height: 36,
              padding: '0 16px',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              cursor: adding || !baseline ? 'default' : 'pointer',
              opacity: adding || !baseline ? 0.5 : 1,
              transition: 'opacity 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            Add Scenario
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              height: 36,
              padding: '0 18px',
              fontSize: 13,
              fontWeight: 600,
              background: saving ? 'var(--color-accent-soft)' : 'var(--color-accent)',
              color: saving ? 'var(--color-accent)' : '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: saving ? 'default' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Spreadsheet */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 28px',
        }}
      >
        {allScenarios.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              fontSize: 14,
              color: 'var(--color-text-tertiary)',
              fontStyle: 'italic',
            }}
          >
            No scenarios yet. Add a scenario to get started.
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'auto',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--color-surface-2)',
                    borderBottom: '2px solid var(--color-border)',
                  }}
                >
                  {/* Row label column header */}
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      borderRight: '2px solid var(--color-border)',
                      width: 200,
                      minWidth: 160,
                    }}
                  >
                    Metric
                  </th>
                  {allScenarios.map(s => (
                    <th
                      key={s.id}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: s.is_baseline
                          ? 'var(--color-text-secondary)'
                          : 'var(--color-text-primary)',
                        borderRight: '1px solid var(--color-border)',
                        minWidth: 130,
                        background: s.is_baseline ? 'var(--color-surface-2)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {s.name}
                        {s.is_baseline && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              padding: '1px 5px',
                              borderRadius: 3,
                              fontFamily: 'var(--font-mono)',
                              background: 'var(--color-surface)',
                              color: 'var(--color-text-tertiary)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            baseline
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, rowIdx) => {
                  if (row.kind === 'separator') {
                    return (
                      <tr key={`sep-${rowIdx}`}>
                        <td
                          colSpan={allScenarios.length + 1}
                          style={{
                            height: 2,
                            background: 'var(--color-border)',
                            padding: 0,
                          }}
                        />
                      </tr>
                    );
                  }

                  if (row.kind === 'derived') {
                    const isEbitda = row.id === 'ebitda';
                    const baselineEbitda = baseline ? calcEBITDA(baseline.inputs) : null;

                    return (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          background: 'var(--color-surface-2)',
                        }}
                      >
                        {/* Label */}
                        <td
                          style={{
                            padding: '10px 16px',
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            borderRight: '2px solid var(--color-border)',
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            background: 'var(--color-surface-2)',
                          }}
                        >
                          {row.label}
                        </td>
                        {allScenarios.map(s => {
                          const val = getDerivedValue(s, row.id);
                          if (val === null) {
                            return (
                              <td
                                key={s.id}
                                style={{
                                  padding: '10px 14px',
                                  fontSize: 12,
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--color-text-tertiary)',
                                  borderRight: '1px solid var(--color-border)',
                                  background: s.is_baseline
                                    ? 'var(--color-surface-2)'
                                    : 'var(--color-surface)',
                                }}
                              >
                                —
                              </td>
                            );
                          }
                          const isBaseline = s.is_baseline;
                          const diff = !isBaseline && baselineEbitda !== null && isEbitda
                            ? val - baselineEbitda
                            : null;
                          const positive = diff !== null && diff >= 0;

                          return (
                            <td
                              key={s.id}
                              style={{
                                padding: '10px 14px',
                                borderRight: '1px solid var(--color-border)',
                                background: isBaseline
                                  ? 'var(--color-surface-2)'
                                  : 'var(--color-surface)',
                                verticalAlign: 'top',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  color: isBaseline
                                    ? 'var(--color-text-secondary)'
                                    : val >= 0
                                    ? 'var(--color-accent)'
                                    : 'var(--color-coral)',
                                }}
                              >
                                {fmtMoney(val)}
                              </div>
                              {diff !== null && Math.abs(diff) > 0.0001 && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    color: positive ? 'var(--color-accent)' : 'var(--color-coral)',
                                    background: positive
                                      ? 'var(--color-accent-soft)'
                                      : 'var(--color-coral-soft)',
                                    borderRadius: 3,
                                    padding: '1px 5px',
                                    display: 'inline-block',
                                    marginTop: 2,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {diff >= 0 ? '+' : ''}
                                  {fmtMoney(diff)} |{' '}
                                  {baselineEbitda !== 0 && baselineEbitda !== null
                                    ? `${diff >= 0 ? '+' : ''}${((diff / Math.abs(baselineEbitda)) * 100).toFixed(0)}%`
                                    : 'n/a'}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }

                  // Input row
                  const baselineVal = baseline ? baseline.inputs[row.key] : 0;

                  return (
                    <tr
                      key={row.key}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      {/* Label */}
                      <td
                        style={{
                          padding: '10px 16px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--color-text-secondary)',
                          borderRight: '2px solid var(--color-border)',
                          whiteSpace: 'nowrap',
                          background: 'var(--color-surface)',
                        }}
                      >
                        {row.label}
                      </td>
                      {allScenarios.map(s => (
                        <EditableCell
                          key={s.id}
                          value={s.inputs[row.key]}
                          baseline={baselineVal}
                          isPct={row.isPct}
                          isBaseline={s.is_baseline}
                          onChange={v => updateInput(s.id, row.key, v)}
                        />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>Click a cell to edit</span>
          <span>·</span>
          <span style={{ color: 'var(--color-accent)' }}>Green delta = improvement</span>
          <span>·</span>
          <span style={{ color: 'var(--color-coral)' }}>Coral delta = decline</span>
          <span>·</span>
          <span>Baseline column is locked</span>
        </div>
      </div>
    </div>
  );
}
