'use client';

import { useState, useRef, useCallback } from 'react';
import type { TreeNode } from '@/types/union';

// ── Tree builder ──────────────────────────────────────────────────────────────
function buildTree(flat: TreeNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  for (const n of flat) map.set(n.id, { ...n, children: [] });
  const roots: TreeNode[] = [];
  for (const n of map.values()) {
    if (n.parent_id === null) roots.push(n);
    else map.get(n.parent_id)?.children?.push(n);
  }
  function sort(nodes: TreeNode[]) {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach(n => n.children?.length && sort(n.children));
  }
  sort(roots);
  return roots;
}

// ── Contextual sub-text per node label ───────────────────────────────────────
const SUB: Record<string, string> = {
  'EBITDA':         'Overhead problem · not margin',
  'Revenue':        '−£3.6m vs budget · volume & price gap',
  'Costs':          'COGS stable · overhead is the gap',
  'Volume':         'Account count declining · dormants uncontacted',
  'Price/Mix':      'Underpriced vs Colefax · Signature gap ~12%',
  'Channel':        'US £5m · DTC under-developed',
  'COGS':           '45.6% of revenue · stable · not addressable',
  'Property':       '11.8% rev · Colefax benchmark 7% · gap £1.3m',
  'Headcount':      '150 staff · £180k/head vs £309k Colefax',
  'Other overhead': 'Marketing · tech · sampling · EU offices',
};

function valueColour(label: string): string {
  if (['EBITDA', 'Costs', 'Property', 'Headcount'].includes(label)) return '#B84A2E';
  if (['Revenue', 'GM%'].includes(label)) return '#1A4A3A';
  if (['Volume', 'Price/Mix', 'Channel', 'Other overhead'].includes(label)) return '#8B6914';
  return '#1A1714';
}

// ── Individual node box ───────────────────────────────────────────────────────
function NodeBox({
  node, isExpanded, hasChildren, onToggle, topBorder, isLeaf, onEdit,
}: {
  node: TreeNode;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  topBorder?: string;
  isLeaf?: boolean;
  onEdit?: (id: string, value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (e: React.MouseEvent) => {
    if (!isLeaf || !onEdit) return;
    e.stopPropagation();
    setDraft(node.value ?? '');
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const commitEdit = async () => {
    setEditing(false);
    if (draft !== (node.value ?? '') && onEdit) {
      await onEdit(node.id, draft);
    }
  };

  return (
    <div
      onClick={hasChildren ? onToggle : undefined}
      style={{
        border: `1px solid ${isExpanded ? '#1A4A3A' : '#E2DDD6'}`,
        borderRadius: 6,
        padding: '10px 12px',
        background: isExpanded ? '#E8F0EC' : isLeaf ? '#F0EDE8' : '#FFFFFF',
        cursor: hasChildren ? 'pointer' : 'default',
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
        position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        ...(topBorder ? { borderTop: `2px solid ${topBorder}` } : {}),
      }}
    >
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#A09890', marginBottom: 5, letterSpacing: '0.04em' }}>
        {node.label}
      </div>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
          style={{
            width: '100%', border: 'none', borderBottom: '2px solid #1A4A3A',
            background: 'transparent', fontSize: 15, fontWeight: 400,
            color: valueColour(node.label), outline: 'none', padding: 0,
          }}
          autoFocus
        />
      ) : (
        <div
          onClick={isLeaf && onEdit ? startEdit : undefined}
          title={isLeaf && onEdit ? 'Click to edit' : undefined}
          style={{
            fontSize: isLeaf ? 15 : 20, fontWeight: isLeaf ? 400 : 300,
            letterSpacing: isLeaf ? '-0.01em' : '-0.02em', color: valueColour(node.label),
            cursor: isLeaf && onEdit ? 'text' : 'inherit',
          }}
        >
          {node.value ?? '—'}
        </div>
      )}
      {SUB[node.label] && !editing && (
        <div style={{ fontSize: 10, color: '#A09890', marginTop: 3, lineHeight: 1.4 }}>
          {SUB[node.label]}
        </div>
      )}
      {hasChildren && (
        <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 9, color: '#A09890', fontFamily: 'var(--font-mono)' }}>
          {isExpanded ? '▴ collapse' : '▾ expand'}
        </div>
      )}
      {isLeaf && onEdit && !editing && (
        <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 8, color: '#C8C0B4', fontFamily: 'var(--font-mono)' }}>
          ✎
        </div>
      )}
    </div>
  );
}

const BTN: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 12, padding: '6px 14px',
  borderRadius: 6, border: '1px solid #C8C0B4', background: 'transparent',
  color: '#1A1714', cursor: 'pointer',
};

// ── Main component ────────────────────────────────────────────────────────────
export default function DiagnosticTree({ initialNodes }: { initialNodes: TreeNode[] }) {
  const [flatNodes, setFlatNodes] = useState<TreeNode[]>(initialNodes);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tree = buildTree(flatNodes);
  const root = tree[0];
  const level1 = root?.children ?? [];
  const rev   = level1.find(n => n.label === 'Revenue');
  const costs = level1.find(n => n.label === 'Costs');

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleEdit = useCallback(async (id: string, value: string) => {
    setFlatNodes(prev => prev.map(n => n.id === id ? { ...n, value } : n));
    await fetch('/api/tree', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, value }),
    });
  }, []);

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(flatNodes.map(n => ({ node: n.label, value: n.value ?? '' })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diagnostic Tree');
    XLSX.writeFile(wb, 'diagnostic-tree.xlsx');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMsg(null);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json<{ node: string; value: string }>(wb.Sheets[wb.SheetNames[0]]);
      if (!rows.length || !('node' in rows[0])) throw new Error('File must have "node" and "value" columns');
      const payload = rows
        .map(r => ({ label: String(r.node).trim(), value: r.value != null ? String(r.value).trim() : null }))
        .filter(r => r.label);
      const res = await fetch('/api/tree', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Import failed');
      const fresh = await fetch('/api/tree', { cache: 'no-store' });
      if (fresh.ok) {
        setFlatNodes(await fresh.json());
        setImportMsg({ type: 'success', text: `Imported ${payload.length} rows successfully` });
      }
    } catch (err) {
      setImportMsg({ type: 'error', text: err instanceof Error ? err.message : 'Import failed' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ padding: 28 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1A1714' }}>Diagnostic Tree</h1>
        <span style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: 3, background: '#F0EDE8', color: '#A09890',
          fontFamily: 'var(--font-mono)',
        }}>internal</span>
      </div>

      {/* Four metric summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Revenue LTM',  value: '£27.0m',  colour: '#1A1714', delta: 'vs budget £30.6m (−£3.6m)' },
          { label: 'Gross margin', value: '54.4%',   colour: '#1A4A3A', delta: 'Stable · not the problem'   },
          { label: 'Overhead',     value: '£16.5m',  colour: '#B84A2E', delta: '61% of revenue · addressable'},
          { label: 'EBITDA',       value: '−£2.0m',  colour: '#B84A2E', delta: 'Target +£5–7m at exit'      },
        ].map(m => (
          <div key={m.label} style={{ background: '#FFFFFF', border: '1px solid #E2DDD6', borderRadius: 6, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#A09890', letterSpacing: '0.04em', marginBottom: 6 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', color: m.colour }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: '#A09890', marginTop: 3 }}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* Import bar */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '12px 16px', background: '#F0EDE8', border: '1px solid #E2DDD6',
        borderRadius: 6, marginBottom: 20,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6B6560" strokeWidth="1.3">
          <path d="M8 1v10M4 7l4 4 4-4"/><path d="M2 13h12"/>
        </svg>
        <span style={{ fontSize: 12, color: '#6B6560', flex: 1 }}>
          No actuals imported. Showing illustrative DG figures. Import Excel / CSV to populate all nodes.
        </span>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
        <button style={BTN} onClick={() => fileInputRef.current?.click()}>Import Excel</button>
        <button style={BTN} onClick={handleExport}>Export</button>
      </div>

      {/* Import status */}
      {importMsg && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: importMsg.type === 'success' ? '#E8F0EC' : '#F7EAE7',
          color: importMsg.type === 'success' ? '#1A4A3A' : '#B84A2E',
        }}>
          {importMsg.text}
          <button onClick={() => setImportMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1, padding: '0 0 0 12px' }}>×</button>
        </div>
      )}

      {/* Tree */}
      {!root ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: '#A09890', background: '#FFFFFF', border: '1px solid #E2DDD6', borderRadius: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No tree data</div>
          <div style={{ fontSize: 12 }}>Check Supabase connection and run the migration SQL.</div>
        </div>
      ) : (
        <div>
          {/* Root — EBITDA, centred, max 260px */}
          <div style={{ maxWidth: 260, margin: '0 auto 4px' }}>
            <NodeBox
              node={root}
              isExpanded={expanded.has(root.id)}
              hasChildren={level1.length > 0}
              onToggle={() => toggle(root.id)}
            />
          </div>

          {/* Vertical connector root → L1 */}
          {expanded.has(root.id) && (
            <div style={{ width: 1, background: '#E2DDD6', height: 10, margin: '0 auto' }} />
          )}

          {/* Level 1 — Revenue + Costs side by side */}
          {expanded.has(root.id) && (
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Revenue branch */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {rev && (
                  <>
                    <NodeBox
                      node={rev}
                      isExpanded={expanded.has(rev.id)}
                      hasChildren={(rev.children?.length ?? 0) > 0}
                      onToggle={() => toggle(rev.id)}
                      topBorder="#1A4A3A"
                    />
                    {/* Level 2 — Revenue leaf nodes */}
                    {expanded.has(rev.id) && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        {(rev.children ?? []).map(leaf => (
                          <div key={leaf.id} style={{ flex: 1 }}>
                            <NodeBox node={leaf} isExpanded={false} hasChildren={false} onToggle={() => {}} isLeaf onEdit={handleEdit} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Cost branch */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {costs && (
                  <>
                    <NodeBox
                      node={costs}
                      isExpanded={expanded.has(costs.id)}
                      hasChildren={(costs.children?.length ?? 0) > 0}
                      onToggle={() => toggle(costs.id)}
                      topBorder="#B84A2E"
                    />
                    {/* Level 2 — Cost leaf nodes */}
                    {expanded.has(costs.id) && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        {(costs.children ?? []).map(leaf => (
                          <div key={leaf.id} style={{ flex: 1 }}>
                            <NodeBox node={leaf} isExpanded={false} hasChildren={false} onToggle={() => {}} isLeaf onEdit={handleEdit} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, fontSize: 11, color: '#A09890', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
            Click any leaf node to drill into sub-components · All editable values live in Scenario Modeller
          </div>
        </div>
      )}
    </div>
  );
}
