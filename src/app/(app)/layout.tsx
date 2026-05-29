'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ChatPanel from '@/components/layout/ChatPanel';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Left sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>

      {/* Right chat panel */}
      <ChatPanel open={chatOpen} onToggle={() => setChatOpen(o => !o)} />
    </div>
  );
}
