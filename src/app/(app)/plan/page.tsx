import { createServerClient } from '@/lib/supabase';
import TwoYearPlan from '@/components/plan2year/TwoYearPlan';

export default async function PlanPage() {
  const sb = createServerClient();
  const [{ data: recs }, { data: cashflow }] = await Promise.all([
    sb.from('recommendations').select('*').order('created_at'),
    sb.from('cashflow').select('*'),
  ]);
  return (
    <TwoYearPlan
      initialRecs={recs ?? []}
      initialCashflow={cashflow ?? []}
    />
  );
}
