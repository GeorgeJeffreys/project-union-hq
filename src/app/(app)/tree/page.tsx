import { createServerClient } from '@/lib/supabase';
import { TreeNode } from '@/types/union';
import DiagnosticTree from '@/components/tree/DiagnosticTree';

export default async function TreePage() {
  const sb = createServerClient();
  const { data } = await sb.from('tree_nodes').select('*').order('sort_order');
  const nodes: TreeNode[] = data ?? [];
  return <DiagnosticTree initialNodes={nodes} />;
}
