import { getBaseUrl } from '@/lib/url';
import RecommendationsModule from '@/components/recommendations/RecommendationsModule';

export default async function RecommendationsPage() {
  const base = getBaseUrl();
  const [recs, cashflow] = await Promise.all([
    fetch(`${base}/api/recommendations`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
    fetch(`${base}/api/cashflow`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
  ]);

  return <RecommendationsModule initialRecs={recs} initialCashflow={cashflow} />;
}
