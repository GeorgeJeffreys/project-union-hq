import { getBaseUrl } from '@/lib/url';
import TwoYearPlan from '@/components/plan2year/TwoYearPlan';

export default async function PlanPage() {
  const base = getBaseUrl();
  const [recs, cashflow] = await Promise.all([
    fetch(`${base}/api/recommendations`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
    fetch(`${base}/api/cashflow`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
  ]);

  return <TwoYearPlan initialRecs={recs} initialCashflow={cashflow} />;
}
