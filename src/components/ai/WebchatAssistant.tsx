import React, { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatMsg { role: 'user' | 'assistant'; content: string }

const WebchatAssistant: React.FC = () => {
  const { user, isAdmin, isManager, isHR } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: 'Hi! How can I help with rotas and shifts?' }]);
  const listRef = useRef<HTMLDivElement>(null);

  const accountType = useMemo(() => {
    if (isAdmin || isHR || isManager) return 'admin';
    return 'employee';
  }, [isAdmin, isHR, isManager]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('webchat-assistant', {
        body: {
          message: text,
          autoExecute: true,
          context: {
            route: window.location.pathname,
            accountType,
            userId: user?.id ?? null,
          },
        },
      });

      if (error) {
        setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I could not process that right now.' }]);
      } else {
        const reply = typeof data?.reply === 'string' ? data.reply : 'Done.';
        setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 50);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const panel = (
    <div
      className={
        isMobile
          ? 'fixed inset-x-0 bottom-0 z-50 p-2'
          : 'fixed bottom-4 right-4 z-50'
      }
      role="dialog"
      aria-label="AI Assistant"
    >
      <Card className={isMobile ? 'h-[65vh] rounded-xl shadow-lg bg-background border' : 'w-[360px] h-[520px] rounded-xl shadow-lg bg-background border'}>
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm font-medium">AI Assistant</div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Close assistant">✕</Button>
        </div>
        <div className="p-0 h-[calc(100%-112px)] flex flex-col">
          <ScrollArea className="flex-1 p-3" ref={listRef as any}>
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={m.role === 'user' ? 'inline-block max-w-[85%] rounded-lg px-3 py-2 bg-muted' : 'inline-block max-w-[85%] rounded-lg px-3 py-2 border'}>
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask me to publish, swap, or check conflicts..."
              aria-label="Type your message"
            />
            <Button onClick={send} disabled={sending}>{sending ? 'Sending' : 'Send'}</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <>
      {!open && (
        <div className={isMobile ? 'fixed right-4 bottom-20 z-40' : 'fixed right-4 bottom-4 z-40'}>
          <Button onClick={() => setOpen(true)} className="rounded-full" aria-label="Open AI assistant">
            Chat
          </Button>
        </div>
      )}
      {open && panel}
    </>
  );
};

export default WebchatAssistant;
