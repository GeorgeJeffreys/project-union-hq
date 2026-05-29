import { getBaseUrl } from '@/lib/url';
import { Option } from '@/types/union';
import WorkstreamExplorer from '@/components/workstream/WorkstreamExplorer';

async function getOptions(): Promise<Option[]> {
  const res = await fetch(`${getBaseUrl()}/api/options`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function WorkstreamPage() {
  const options = await getOptions();
  return <WorkstreamExplorer initialOptions={options} />;
}
