import { getBaseUrl } from '@/lib/url';
import { Scenario } from '@/types/union';
import ScenarioModeller from '@/components/scenarios/ScenarioModeller';

async function getScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${getBaseUrl()}/api/scenarios`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function ScenariosPage() {
  const scenarios = await getScenarios();
  return <ScenarioModeller initialScenarios={scenarios} />;
}
