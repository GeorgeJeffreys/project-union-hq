import { createServerClient } from '@/lib/supabase';
import StrategyPillars from '@/components/pillars/StrategyPillars';

const DEFAULT_GOAL = 'Restore Designers Guild to sustained profitability and position for a premium exit at 8–10× EBITDA in 24–30 months.';
const DEFAULT_STRATEGY = 'Close the £7–9m EBITDA gap through five interlocked workstreams: trade account recovery, pricing discipline, structural cost reduction, US channel expansion, and investor-ready exit preparation.';

export default async function PillarsPage() {
  const sb = createServerClient();
  const { data } = await sb.from('settings').select('key, value').in('key', ['pillar_goal', 'pillar_strategy']);
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return (
    <StrategyPillars
      initialGoal={map.pillar_goal ?? DEFAULT_GOAL}
      initialStrategy={map.pillar_strategy ?? DEFAULT_STRATEGY}
    />
  );
}
