import { createServerClient } from '@/lib/supabase';
import RecommendationsModule from '@/components/recommendations/RecommendationsModule';

export default async function RecommendationsPage() {
  const sb = createServerClient();
  const [{ data: recs }, { data: cashflow }] = await Promise.all([
    sb.from('recommendations').select('*').order('created_at'),
    sb.from('cashflow').select('*'),
  ]);
  return (
    <RecommendationsModule
      initialRecs={recs ?? []}
      initialCashflow={cashflow ?? []}
    />
  );
}
