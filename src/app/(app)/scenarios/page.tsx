import { createServerClient } from '@/lib/supabase';
import { Scenario } from '@/types/union';
import ScenarioModeller from '@/components/scenarios/ScenarioModeller';

export default async function ScenariosPage() {
  const sb = createServerClient();
  const { data } = await sb.from('scenarios').select('*').order('created_at');
  const scenarios: Scenario[] = data ?? [];
  return <ScenarioModeller initialScenarios={scenarios} />;
}
