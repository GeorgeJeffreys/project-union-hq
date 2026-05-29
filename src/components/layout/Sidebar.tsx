'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    section: 'PROJECT',
    items: [
      { label: 'Engagement Calendar', href: '/calendar', badge: 'internal' },
    ],
  },
  {
    section: 'ANALYSIS',
    items: [
      { label: 'Diagnostic Tree',      href: '/tree',       badge: 'internal' },
      { label: 'Workstream Explorer',  href: '/workstream', badge: 'internal' },
      { label: 'Scenario Modeller',    href: '/scenarios',  badge: 'client'   },
    ],
  },
  {
    section: 'STRATEGY',
    items: [
      { label: 'Strategy Pillars',     href: '/pillars',         badge: 'client' },
      { label: 'Recommendations',      href: '/recommendations', badge: 'client' },
      { label: '2-Year Plan',          href: '/plan',            badge: 'client' },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside
      style={{
        width: 232,
        minWidth: 232,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Wordmark */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>
          Project Union
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Designers Guild
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'var(--color-text-tertiary)',
              padding: '8px 20px 4px',
              fontFamily: 'var(--font-mono)',
            }}>
              {section}
            </div>
            {items.map(({ label, href, badge }) => {
              const active = path === href || path.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 20px',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    background: active ? 'var(--color-accent-soft)' : 'transparent',
                    textDecoration: 'none',
                    borderLeft: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                >
                  <span>{label}</span>
                  <BadgeChip type={badge as 'client' | 'internal'} />
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--color-border)',
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        fontFamily: 'var(--font-mono)',
      }}>
        v1.0 · Confidential
      </div>
    </aside>
  );
}

function BadgeChip({ type }: { type: 'client' | 'internal' }) {
  const isClient = type === 'client';
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '2px 5px',
      borderRadius: 3,
      fontFamily: 'var(--font-mono)',
      background: isClient ? 'var(--color-gold-soft)' : 'var(--color-surface-2)',
      color: isClient ? 'var(--color-gold)' : 'var(--color-text-tertiary)',
    }}>
      {type}
    </span>
  );
}
