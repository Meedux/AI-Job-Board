"use client";

import { useEffect, useState, useCallback } from 'react';

const MessagingCenter = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    const res = await fetch('/api/messages/conversations');
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations || []);
      if (!activeId && data.conversations?.[0]?.id) {
        setActiveId(data.conversations[0].id);
      }
    }
  }, [activeId]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    const res = await fetch(`/api/messages/${conversationId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeId) fetchMessages(activeId);
  }, [activeId, fetchMessages]);

  useEffect(() => {
    const es = new EventSource('/api/notifications/stream');
    const handleMessage = (event) => {
      const payload = JSON.parse(event.data || '{}');
      if (payload.conversationId === activeId && payload.message) {
        setMessages((prev) => [...prev, payload.message]);
      }
    };
    es.addEventListener('message', handleMessage);
    return () => {
      es.removeEventListener('message', handleMessage);
      es.close();
    };
  }, [activeId]);

  const send = async () => {
    if (!draft.trim() || !activeId) return;
    setLoading(true);
    const res = await fetch(`/api/messages/${activeId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: draft })
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setDraft('');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800">
      <div className="col-span-4 space-y-2">
        <div className="text-sm uppercase tracking-wide text-slate-400">Conversations</div>
        <div className="max-h-96 overflow-auto divide-y divide-slate-800 border border-slate-800 rounded-lg">
          {conversations.map((c) => (
            <button
              key={c.id}
              className={`w-full text-left px-3 py-2 hover:bg-slate-800 ${activeId === c.id ? 'bg-slate-800' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <div className="font-semibold">{c.title || c.type}</div>
              <div className="text-xs text-slate-400">Participants: {c.participants?.length || 0}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="col-span-8 flex flex-col space-y-3">
        <div className="flex-1 border border-slate-800 rounded-lg p-3 bg-slate-950 overflow-auto min-h-[320px]">
          {messages.map((m) => (
            <div key={m.id} className="mb-2">
              <div className="text-xs text-slate-400">{m.sentAt ? new Date(m.sentAt).toLocaleString() : ''}</div>
              <div className="bg-slate-800 rounded px-3 py-2 inline-block">{m.content}</div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            onClick={send}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
