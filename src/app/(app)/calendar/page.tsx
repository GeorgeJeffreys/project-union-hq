import { getBaseUrl } from '@/lib/url';
import { Task } from '@/types/union';
import CalendarModule from '@/components/calendar/CalendarModule';

async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${getBaseUrl()}/api/tasks`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function CalendarPage() {
  const tasks = await getTasks();
  return <CalendarModule initialTasks={tasks} />;
}
