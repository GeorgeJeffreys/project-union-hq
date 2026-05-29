'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types/union';

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function ChatPanel({ open, onToggle }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSupabase()
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data as ChatMessage[]); });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const parseAndExecuteAction = useCallback(async (text: string) => {
    const ACTION_REGEX = /<action>([\s\S]*?)<\/action>/g;
    const matches = [...text.matchAll(ACTION_REGEX)];
    if (matches.length === 0) return;
    const sb = getSupabase();
    for (const match of matches) {
      try {
        const action = JSON.parse(match[1]);
        if (action.type === 'add_recommendation') {
          const { data: recData } = await sb.from('recommendations').insert(action.data).select('id').single();
          if (recData?.id) {
            const cashflowRows = Array.from({ length: 8 }, (_, i) => ({
              rec_id: recData.id,
              quarter: i + 1,
              cost_out: 0,
              saving_in: 0,
            }));
            await sb.from('cashflow').insert(cashflowRows);
          }
          showToast('✓ Added to Recommendations');
        } else if (action.type === 'add_task') {
          await sb.from('tasks').insert(action.data);
          showToast('✓ Added to Calendar');
        } else if (action.type === 'add_option') {
          await sb.from('options').insert(action.data);
          showToast('✓ Added to Workstream');
        } else if (action.type === 'add_scenario') {
          await sb.from('scenarios').insert(action.data);
          showToast('✓ Added to Scenarios');
        }
      } catch { /* ignore parse errors */ }
    }
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      await parseAndExecuteAction(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--color-accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px 0 0 6px',
          padding: '12px 8px',
          writingMode: 'vertical-rl',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          cursor: 'pointer',
          zIndex: 50,
        }}
      >
        CLAUDE
      </button>
    );
  }

  return (
    <aside style={{
      width: 360,
      minWidth: 360,
      background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Claude · Project Union</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>McKinsey-level strategy assistant</div>
        </div>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: 18, lineHeight: 1, padding: 4 }}
          title="Collapse"
        >
          ›
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 40 }}>
            Ask me anything about Project Union — data, recommendations, analysis.
          </div>
        )}
        {messages.map(m => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        {sending && (
          <div style={{ alignSelf: 'flex-start' }}>
            <TypingDots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: 8,
        flexShrink: 0,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Ask Claude…"
          rows={2}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            background: sending || !input.trim() ? 'var(--color-border)' : 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: sending || !input.trim() ? 'default' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          Send
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-accent)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}
    </aside>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  // Strip <action>...</action> tags from display
  const display = msg.content.replace(/<action>[\s\S]*?<\/action>/g, '').trim();

  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '85%',
    }}>
      <div style={{
        background: isUser ? 'var(--color-accent)' : 'var(--color-surface-2)',
        color: isUser ? '#fff' : 'var(--color-text-primary)',
        padding: '10px 14px',
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        fontSize: 13,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {display}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{
      background: 'var(--color-surface-2)',
      padding: '10px 16px',
      borderRadius: '12px 12px 12px 2px',
      display: 'flex',
      gap: 4,
      alignItems: 'center',
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--color-text-tertiary)',
          display: 'inline-block',
          animation: `bounce 1.2s ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
