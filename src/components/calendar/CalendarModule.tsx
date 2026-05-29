'use client';

import { useState } from 'react';
import { Task, TaskType } from '@/types/union';
import TaskModal from './TaskModal';

const LANES = ['Discovery', 'Revenue', 'Cost', 'Client'] as const;
const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type LaneName = typeof LANES[number];

interface Props {
  initialTasks: Task[];
}

// ── Design-token colour maps ─────────────────────────────────────────────────
const TYPE_COLOURS: Record<TaskType, { bg: string; text: string; dot: string }> = {
  discussion:     { bg: 'var(--color-blue-soft)',   text: 'var(--color-blue)',   dot: 'var(--color-blue)' },
  analysis:       { bg: 'var(--color-gold-soft)',   text: 'var(--color-gold)',   dot: 'var(--color-gold)' },
  problem:        { bg: 'var(--color-coral-soft)',  text: 'var(--color-coral)',  dot: 'var(--color-coral)' },
  recommendation: { bg: 'var(--color-accent-soft)', text: 'var(--color-accent)', dot: 'var(--color-accent)' },
  done:           { bg: 'var(--color-surface-2)',   text: 'var(--color-text-tertiary)', dot: 'var(--color-text-tertiary)' },
};

const TYPE_LABELS: Record<TaskType, string> = {
  discussion: 'Discussion',
  analysis: 'Analysis',
  problem: 'Problem',
  recommendation: 'Recommendation',
  done: 'Done',
};

function truncate(str: string, max = 22): string {
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}

// ── Task Chip ────────────────────────────────────────────────────────────────
function TaskChip({ task }: { task: Task }) {
  const colours = TYPE_COLOURS[task.type];
  return (
    <div
      style={{
        background: colours.bg,
        borderRadius: 5,
        padding: '4px 7px',
        marginBottom: 4,
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: colours.dot,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: colours.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 130,
            textDecoration: task.type === 'done' ? 'line-through' : 'none',
          }}
        >
          {truncate(task.title)}
        </span>
      </div>
      {task.owner && (
        <div
          style={{
            fontSize: 9,
            color: colours.text,
            opacity: 0.7,
            marginTop: 1,
            marginLeft: 9,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          {task.owner}
        </div>
      )}
    </div>
  );
}

// ── Skeleton cell ────────────────────────────────────────────────────────────
function SkeletonCell() {
  return (
    <div style={{ padding: '6px 4px' }}>
      {[70, 50, 85].map((w, i) => (
        <div
          key={i}
          style={{
            height: 28,
            borderRadius: 5,
            marginBottom: 4,
            background: 'var(--color-surface-2)',
            width: `${w}%`,
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
}

// ── Type badge (used in accordion) ──────────────────────────────────────────
function TypeBadge({ type }: { type: TaskType }) {
  const colours = TYPE_COLOURS[type];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: colours.bg,
        color: colours.text,
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
      }}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CalendarModule({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading] = useState(false);
  const [expandedLane, setExpandedLane] = useState<LaneName | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleTaskSaved = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const toggleLane = (lane: LaneName) => {
    setExpandedLane(prev => (prev === lane ? null : lane));
  };

  const getTasksForCell = (lane: LaneName, week: number) =>
    tasks.filter(t => t.lane === lane && t.week === week);

  const getTasksForLane = (lane: LaneName) =>
    tasks.filter(t => t.lane === lane).sort((a, b) => a.week - b.week || a.title.localeCompare(b.title));

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Project Union · Internal
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Engagement Calendar
          </h1>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            8-week workplan across all engagement lanes
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          Add Task
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {(Object.keys(TYPE_COLOURS) as TaskType[]).map(type => {
          const c = TYPE_COLOURS[type];
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: c.dot,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {TYPE_LABELS[type]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Keyframe style for skeleton pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Calendar table */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Table header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px repeat(8, 1fr)',
            borderBottom: '2px solid var(--color-border)',
            background: 'var(--color-surface-2)',
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              borderRight: '1px solid var(--color-border)',
            }}
          >
            Lane
          </div>
          {WEEKS.map(w => (
            <div
              key={w}
              style={{
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                borderRight: w < 8 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              Wk {w}
            </div>
          ))}
        </div>

        {/* Lane rows */}
        {LANES.map((lane, laneIdx) => {
          const isExpanded = expandedLane === lane;
          const laneTasks = getTasksForLane(lane);
          const isLast = laneIdx === LANES.length - 1;

          return (
            <div key={lane}>
              {/* Lane swimlane row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px repeat(8, 1fr)',
                  borderBottom: isLast && !isExpanded ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {/* Lane label */}
                <div
                  onClick={() => toggleLane(lane)}
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    borderRight: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--color-accent-soft)' : 'transparent',
                    transition: 'background 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: isExpanded ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▶
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isExpanded ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {lane}
                  </span>
                </div>

                {/* Week cells */}
                {WEEKS.map(week => {
                  const cellTasks = getTasksForCell(lane, week);
                  return (
                    <div
                      key={week}
                      style={{
                        padding: '6px 4px',
                        minHeight: 60,
                        borderRight: week < 8 ? '1px solid var(--color-border)' : 'none',
                        verticalAlign: 'top',
                      }}
                    >
                      {loading ? (
                        <SkeletonCell />
                      ) : (
                        cellTasks.map(task => <TaskChip key={task.id} task={task} />)
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Accordion panel */}
              {isExpanded && (
                <div
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    padding: '0 16px 12px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: 'var(--color-text-tertiary)',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-mono)',
                      padding: '12px 0 8px',
                      borderBottom: '1px solid var(--color-border)',
                      marginBottom: 4,
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr 80px 50px',
                      gap: 12,
                    }}
                  >
                    <span>Type</span>
                    <span>Title</span>
                    <span>Owner</span>
                    <span style={{ textAlign: 'center' }}>Week</span>
                  </div>

                  {laneTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '16px 0',
                        color: 'var(--color-text-tertiary)',
                        fontSize: 12,
                        textAlign: 'center',
                      }}
                    >
                      No tasks in this lane yet
                    </div>
                  ) : (
                    laneTasks.map(task => (
                      <div
                        key={task.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '110px 1fr 80px 50px',
                          gap: 12,
                          padding: '7px 0',
                          borderBottom: '1px solid var(--color-border)',
                          alignItems: 'center',
                        }}
                      >
                        <TypeBadge type={task.type} />
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--color-text-primary)',
                            fontWeight: 500,
                            textDecoration: task.type === 'done' ? 'line-through' : 'none',
                            textDecorationColor: 'var(--color-text-tertiary)',
                          }}
                        >
                          {task.title}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {task.owner ?? '—'}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--color-text-tertiary)',
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {task.week}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task count footer */}
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal onClose={() => setShowModal(false)} onSave={handleTaskSaved} />
      )}
    </div>
  );
}
