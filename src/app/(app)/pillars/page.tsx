import { getBaseUrl } from '@/lib/url';
import StrategyPillars from '@/components/pillars/StrategyPillars';

const DEFAULT_GOAL = 'Restore Designers Guild to sustained profitability and position for a premium exit at 8–10× EBITDA in 24–30 months.';
const DEFAULT_STRATEGY = 'Close the £7–9m EBITDA gap through five interlocked workstreams: trade account recovery, pricing discipline, structural cost reduction, US channel expansion, and investor-ready exit preparation.';

async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/settings?key=${key}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    const data = await res.json();
    return data.value ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function PillarsPage() {
  const [goal, strategy] = await Promise.all([
    getSetting('pillar_goal', DEFAULT_GOAL),
    getSetting('pillar_strategy', DEFAULT_STRATEGY),
  ]);
  return <StrategyPillars initialGoal={goal} initialStrategy={strategy} />;
}
