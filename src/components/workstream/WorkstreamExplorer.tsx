'use client';

import { useState, useCallback } from 'react';
import { Option, Stage, Workstream } from '@/types/union';
import AddOptionModal from './AddOptionModal';

interface WorkstreamExplorerProps {
  initialOptions: Option[];
}

function fmtImpact(low: number | null, high: number | null): string {
  if (low === null && high === null) return '—';
  const fmt = (n: number) => `£${n.toFixed(1)}m`;
  if (low !== null && high !== null) return `${fmt(low)}–${fmt(high)}`;
  if (low !== null) return fmt(low);
  return fmt(high!);
}

function fmtCost(cost: number | null): string {
  if (cost === null) return '—';
  return `£${cost.toFixed(1)}m`;
}

const STAGE_ORDER: Stage[] = ['could', 'can', 'should'];

const STAGE_META: Record<Stage, { label: string; bg: string; color: string }> = {
  could: {
    label: 'Could',
    bg: 'var(--color-surface-2)',
    color: 'var(--color-text-secondary)',
  },
  can: {
    label: 'Can',
    bg: 'var(--color-blue-soft)',
    color: 'var(--color-blue)',
  },
  should: {
    label: 'Should',
    bg: 'var(--color-gold-soft)',
    color: 'var(--color-gold)',
  },
};

function promoteLabel(stage: Stage): string {
  if (stage === 'could') return '→ Can';
  if (stage === 'can') return '↑ Should';
  return '★';
}

// Skeleton loading state
function TableSkeleton() {
  return (
    <div style={{ flex: 1 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div
            style={{
              height: 36,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 8,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          {[0, 1].map(j => (
            <div
              key={j}
              style={{
                height: 44,
                borderRadius: 6,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                marginBottom: 4,
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${(i * 2 + j) * 0.1}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface WorkstreamTableProps {
  workstream: Workstream;
  options: Option[];
  onPromote: (option: Option) => void;
}

function WorkstreamTable({ workstream, options, onPromote }: WorkstreamTableProps) {
  const [collapsed, setCollapsed] = useState<Record<Stage, boolean>>({
    could: false,
    can: false,
    should: false,
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleSection = (stage: Stage) => {
    setCollapsed(prev => ({ ...prev, [stage]: !prev[stage] }));
  };

  const toggleRow = (id: string) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  const byStage: Record<Stage, Option[]> = {
    could: options.filter(o => o.stage === 'could'),
    can: options.filter(o => o.stage === 'can'),
    should: options.filter(o => o.stage === 'should'),
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 110px 80px 70px 80px',
          gap: 0,
          padding: '0 12px',
          marginBottom: 4,
        }}
      >
        {['Option', 'Impact', 'Cash cost', 'Node', ''].map((h, i) => (
          <div
            key={i}
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              paddingBottom: 6,
              borderBottom: '1px solid var(--color-border)',
              textAlign: i === 4 ? 'center' : 'left',
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Sections */}
      {STAGE_ORDER.map(stage => {
        const meta = STAGE_META[stage];
        const rows = byStage[stage];
        const isCollapsed = collapsed[stage];

        return (
          <div key={stage} style={{ marginTop: 10 }}>
            {/* Section header */}
            <button
              onClick={() => toggleSection(stage)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  color: meta.color,
                  background: meta.bg,
                  border: `1px solid ${meta.color}22`,
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                }}
              >
                {meta.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {rows.length}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 9,
                  color: 'var(--color-text-tertiary)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </button>

            {!isCollapsed && (
              <div>
                {rows.length === 0 && (
                  <div
                    style={{
                      padding: '10px 12px',
                      fontSize: 12,
                      color: 'var(--color-text-tertiary)',
                      fontStyle: 'italic',
                    }}
                  >
                    No options in this stage
                  </div>
                )}
                {rows.map(option => {
                  const isExpanded = expandedRow === option.id;
                  return (
                    <div key={option.id}>
                      {/* Main row */}
                      <div
                        onClick={() => toggleRow(option.id)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 110px 80px 70px 80px',
                          gap: 0,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          background: isExpanded
                            ? 'var(--color-accent-soft)'
                            : 'transparent',
                          borderBottom: '1px solid var(--color-border)',
                          transition: 'background 0.1s',
                          alignItems: 'center',
                        }}
                        onMouseEnter={e => {
                          if (!isExpanded) {
                            (e.currentTarget as HTMLDivElement).style.background =
                              'var(--color-surface-2)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isExpanded) {
                            (e.currentTarget as HTMLDivElement).style.background =
                              'transparent';
                          }
                        }}
                      >
                        {/* Title */}
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              color: 'var(--color-text-tertiary)',
                              transition: 'transform 0.2s',
                              display: 'inline-block',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              flexShrink: 0,
                            }}
                          >
                            ▶
                          </span>
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {option.title}
                          </span>
                        </div>

                        {/* Impact */}
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-accent)',
                            fontWeight: 600,
                          }}
                        >
                          {fmtImpact(option.impact_low, option.impact_high)}
                        </div>

                        {/* Cash cost */}
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-coral)',
                          }}
                        >
                          {fmtCost(option.cash_cost)}
                        </div>

                        {/* Node */}
                        <div
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-tertiary)',
                          }}
                        >
                          {option.tree_node ?? '—'}
                        </div>

                        {/* Promote button */}
                        <div
                          style={{ textAlign: 'center' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onPromote(option)}
                            title={
                              stage === 'should'
                                ? 'Promote to Recommendations'
                                : `Promote to ${stage === 'could' ? 'Can' : 'Should'}`
                            }
                            style={{
                              height: 26,
                              padding: '0 10px',
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: 'var(--font-mono)',
                              borderRadius: 5,
                              border: '1px solid var(--color-border)',
                              background:
                                stage === 'should'
                                  ? 'var(--color-gold-soft)'
                                  : 'var(--color-surface)',
                              color:
                                stage === 'should'
                                  ? 'var(--color-gold)'
                                  : 'var(--color-text-secondary)',
                              cursor: 'pointer',
                              transition: 'background 0.15s, color 0.15s',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {promoteLabel(stage)}
                          </button>
                        </div>
                      </div>

                      {/* Accordion rationale */}
                      {isExpanded && (
                        <div
                          style={{
                            background: 'var(--color-accent-soft)',
                            borderBottom: '1px solid var(--color-border)',
                            padding: '10px 36px 12px',
                          }}
                        >
                          {option.description && (
                            <div style={{ marginBottom: 6 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  color: 'var(--color-text-tertiary)',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                Description
                              </span>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: 'var(--color-text-secondary)',
                                  marginTop: 3,
                                  lineHeight: 1.5,
                                }}
                              >
                                {option.description}
                              </div>
                            </div>
                          )}
                          {option.rationale && (
                            <div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  color: 'var(--color-text-tertiary)',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                Rationale
                              </span>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: 'var(--color-text-secondary)',
                                  marginTop: 3,
                                  lineHeight: 1.5,
                                }}
                              >
                                {option.rationale}
                              </div>
                            </div>
                          )}
                          {!option.description && !option.rationale && (
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--color-text-tertiary)',
                                fontStyle: 'italic',
                              }}
                            >
                              No rationale provided.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function WorkstreamExplorer({ initialOptions }: WorkstreamExplorerProps) {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [showModal, setShowModal] = useState(false);
  const [loading] = useState(false);

  const handlePromote = useCallback(async (option: Option) => {
    // Optimistic update
    const nextStage: Record<Stage, Stage | null> = {
      could: 'can',
      can: 'should',
      should: null,
    };
    const next = nextStage[option.stage];

    if (next === null) {
      // Promote to recommendations — remove from local list optimistically
      setOptions(prev => prev.filter(o => o.id !== option.id));
    } else {
      setOptions(prev =>
        prev.map(o => (o.id === option.id ? { ...o, stage: next } : o))
      );
    }

    try {
      await fetch('/api/options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: option.id, promote: true }),
      });
    } catch {
      // Revert on error
      setOptions(prev => {
        const idx = prev.findIndex(o => o.id === option.id);
        if (idx === -1) {
          // Was removed (should→recs), add back
          return [...prev, option].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
        return prev.map(o => (o.id === option.id ? option : o));
      });
    }
  }, []);

  const handleAdded = useCallback((newOption: Option) => {
    setOptions(prev => [...prev, newOption]);
  }, []);

  const revenueOptions = options.filter(o => o.workstream === 'revenue');
  const costOptions = options.filter(o => o.workstream === 'cost');

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
              Workstream Explorer
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                marginTop: 2,
              }}
            >
              Revenue &amp; cost options, staged by feasibility
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
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border)',
            }}
          >
            internal
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            height: 36,
            padding: '0 18px',
            fontSize: 13,
            fontWeight: 600,
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          Add Option
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 28px',
          display: 'flex',
          gap: 24,
          minHeight: 0,
        }}
      >
        {loading ? (
          <>
            <TableSkeleton />
            <div
              style={{
                width: 1,
                background: 'var(--color-border)',
                flexShrink: 0,
              }}
            />
            <TableSkeleton />
          </>
        ) : (
          <>
            {/* Revenue table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                  }}
                />
                Revenue
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'none',
                    letterSpacing: '0',
                  }}
                >
                  {revenueOptions.length} options
                </span>
              </div>
              <WorkstreamTable
                workstream="revenue"
                options={revenueOptions}
                onPromote={handlePromote}
              />
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                background: 'var(--color-border)',
                flexShrink: 0,
                alignSelf: 'stretch',
              }}
            />

            {/* Cost table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-coral)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-coral)',
                  }}
                />
                Cost
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'none',
                    letterSpacing: '0',
                  }}
                >
                  {costOptions.length} options
                </span>
              </div>
              <WorkstreamTable
                workstream="cost"
                options={costOptions}
                onPromote={handlePromote}
              />
            </div>
          </>
        )}
      </div>

      {/* Add Option Modal */}
      {showModal && (
        <AddOptionModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
      )}
    </div>
  );
}
