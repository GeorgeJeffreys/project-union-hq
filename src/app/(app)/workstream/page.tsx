import { createServerClient } from '@/lib/supabase';
import { Option } from '@/types/union';
import WorkstreamExplorer from '@/components/workstream/WorkstreamExplorer';

export default async function WorkstreamPage() {
  const sb = createServerClient();
  const { data } = await sb.from('options').select('*').order('created_at');
  const options: Option[] = data ?? [];
  return <WorkstreamExplorer initialOptions={options} />;
}
