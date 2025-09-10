'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

type Message = { role: 'user' | 'model'; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: prompt }]);
    setLoading(true);
    try {
      const res = await api.generateText(prompt);
      if (res.error || !res.data) {
        setMessages((m) => [...m, { role: 'model', text: `Hata: ${res.error?.message || 'generation_failed'}` }]);
      } else {
        setMessages((m) => [...m, { role: 'model', text: res.data?.text || '(boş yanıt)' }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'model', text: `Hata: ${e?.message || 'unknown'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Sohbet (Metin)</h2>
          <p className="text-gray-600 dark:text-slate-300">Gemini 2.5-flash ile metin tabanlı sohbet</p>
        </div>
        <Link href="/" className="text-blue-600 hover:underline">Görsel Düzenleme</Link>
      </div>

      <div ref={listRef} className="bg-white dark:bg-slate-900 rounded-lg shadow-soft border border-gray-100 dark:border-slate-800 h-[60vh] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-gray-400 text-center mt-20">Bir mesaj yazın ve Enter'a basın</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100">
              Yazıyor...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Mesajınızı yazın ve Enter'a basın"
        />
        <Button onClick={send} disabled={loading || !input.trim()}>Gönder</Button>
      </div>
    </div>
  );
}
