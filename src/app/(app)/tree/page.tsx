import { getBaseUrl } from '@/lib/url';
import { TreeNode } from '@/types/union';
import DiagnosticTree from '@/components/tree/DiagnosticTree';

async function getTreeNodes(): Promise<TreeNode[]> {
  const res = await fetch(`${getBaseUrl()}/api/tree`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function TreePage() {
  const nodes = await getTreeNodes();
  return <DiagnosticTree initialNodes={nodes} />;
}
