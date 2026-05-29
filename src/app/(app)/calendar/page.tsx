import { createServerClient } from '@/lib/supabase';
import { Task } from '@/types/union';
import CalendarModule from '@/components/calendar/CalendarModule';

export default async function CalendarPage() {
  const sb = createServerClient();
  const { data } = await sb.from('tasks').select('*').order('week').order('created_at');
  const tasks: Task[] = data ?? [];
  return <CalendarModule initialTasks={tasks} />;
}
