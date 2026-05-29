'use client';

import { TreeNode } from '@/types/union';

interface Props {
  node: TreeNode;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
  onValueChange: (id: string, value: string) => void;
  hasChildren: boolean;
  isSaving?: boolean;
}

const DEPTH_STYLES: Record<number, { border: string; bg: string; labelColor: string; headerBg: string }> = {
  0: {
    border: '2px solid var(--color-accent)',
    bg: 'var(--color-surface)',
    labelColor: 'var(--color-accent)',
    headerBg: 'var(--color-accent-soft)',
  },
  1: {
    border: '1.5px solid var(--color-gold)',
    bg: 'var(--color-surface)',
    labelColor: 'var(--color-gold)',
    headerBg: 'var(--color-gold-soft)',
  },
  2: {
    border: '1px solid var(--color-border)',
    bg: 'var(--color-surface)',
    labelColor: 'var(--color-text-primary)',
    headerBg: 'var(--color-surface-2)',
  },
};

function getDepthStyle(depth: number) {
  return DEPTH_STYLES[Math.min(depth, 2)];
}

export default function TreeNodeCard({
  node,
  depth,
  expanded,
  onToggle,
  onValueChange,
  hasChildren,
  isSaving,
}: Props) {
  const ds = getDepthStyle(depth);
  const cardWidth = depth === 0 ? 220 : depth === 1 ? 200 : 180;

  return (
    <div
      style={{
        width: cardWidth,
        minWidth: cardWidth,
        border: ds.border,
        borderRadius: 10,
        background: ds.bg,
        boxShadow: depth === 0
          ? '0 4px 16px rgba(26,74,58,0.12)'
          : depth === 1
          ? '0 2px 8px rgba(139,105,20,0.08)'
          : '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
        flexShrink: 0,
      }}
    >
      {/* Card header */}
      <div
        style={{
          background: ds.headerBg,
          padding: depth === 0 ? '10px 14px' : '8px 12px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: depth === 0 ? 13 : depth === 1 ? 12 : 11,
            fontWeight: 700,
            color: ds.labelColor,
            letterSpacing: depth === 0 ? '0.02em' : '0.01em',
            lineHeight: 1.3,
            flex: 1,
            minWidth: 0,
          }}
        >
          {node.label}
        </span>

        {hasChildren && (
          <button
            onClick={onToggle}
            title={expanded ? 'Collapse' : 'Expand'}
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-tertiary)',
              fontSize: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ▶
          </button>
        )}
      </div>

      {/* Value area */}
      <div style={{ padding: depth === 0 ? '10px 14px' : '8px 12px' }}>
        {node.is_editable ? (
          <input
            type="text"
            value={node.value ?? ''}
            onChange={e => onValueChange(node.id, e.target.value)}
            placeholder="—"
            style={{
              width: '100%',
              border: 'none',
              borderBottom: '1px dashed var(--color-border)',
              background: 'transparent',
              fontFamily: 'var(--font-mono)',
              fontSize: depth === 0 ? 16 : depth === 1 ? 15 : 13,
              fontWeight: 600,
              color: 'var(--color-gold)',
              outline: 'none',
              padding: '2px 0',
              textAlign: 'right',
            }}
          />
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: depth === 0 ? 16 : depth === 1 ? 15 : 13,
              fontWeight: 600,
              color: node.value ? 'var(--color-gold)' : 'var(--color-text-tertiary)',
              textAlign: 'right',
              letterSpacing: '0.02em',
            }}
          >
            {node.value ?? '—'}
          </div>
        )}

        {isSaving && (
          <div
            style={{
              fontSize: 9,
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              textAlign: 'right',
              marginTop: 2,
            }}
          >
            saving…
          </div>
        )}
      </div>
    </div>
  );
}
