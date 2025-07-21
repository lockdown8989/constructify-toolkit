import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, content: string, isAi: boolean, timestamp: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('ChatWidget: Rendering, user:', user, 'isOpen:', isOpen);

  // Don't render if user is not authenticated
  if (!user) {
    console.log('ChatWidget: No user, not rendering');
    return null;
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      content: message.trim(),
      isAi: false,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai-assistant', {
        body: {
          message: currentMessage,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      const aiMessage = {
        id: crypto.randomUUID(),
        content: data.response || "I'm sorry, I couldn't process your request.",
        isAi: true,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = {
        id: crypto.randomUUID(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        isAi: true,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-background border border-border rounded-lg shadow-lg z-50 flex flex-col md:w-96 md:h-[600px] sm:w-80 sm:h-[500px] xs:w-72 xs:h-[450px]">
          <div className="p-4 bg-muted/50 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Chat Assistant</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto max-h-96">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Welcome! I'm your AI assistant. How can I help you today?
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs rounded-lg p-3 ${
                      msg.isAi 
                        ? 'bg-muted text-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm border rounded-md"
                disabled={isLoading}
              />
              <Button 
                size="sm" 
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <Button
        onClick={() => {
          console.log('ChatWidget: Button clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className={cn(
          "fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-40 p-0",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-200 ease-in-out",
          "md:w-14 md:h-14 sm:w-12 sm:h-12"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </>
  );
};