import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/hooks/use-chat';
import { Bot, Image as ImageIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isAiMode: boolean;
  currentEmployeeId: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isTyping,
  isAiMode,
  currentEmployeeId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.message_type === 'image' && message.attachment_url) {
      return (
        <div className="space-y-2">
          {message.content && (
            <p className="text-base md:text-sm mobile-chat-message">{message.content}</p>
          )}
          <div className="relative max-w-xs">
            <img
              src={message.attachment_url}
              alt={message.attachment_name || 'Attachment'}
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: '200px' }}
            />
            {message.attachment_name && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <ImageIcon className="w-3 h-3" />
                <span>{message.attachment_name}</span>
                {message.attachment_size && (
                  <span>({(message.attachment_size / 1024).toFixed(1)} KB)</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (message.attachment_url && message.message_type === 'text') {
      return (
        <div className="space-y-2">
          {message.content && (
            <p className="text-base md:text-sm mobile-chat-message">{message.content}</p>
          )}
          <div className="flex items-center gap-2 p-3 md:p-2 border border-border rounded-lg bg-muted/50">
            <Download className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.attachment_name}</p>
              {message.attachment_size && (
                <p className="text-xs text-muted-foreground">
                  {(message.attachment_size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm md:text-xs text-primary hover:underline touch-manipulation"
            >
              Download
            </a>
          </div>
        </div>
      );
    }

    return <p className="text-base md:text-sm mobile-chat-message leading-relaxed">{message.content}</p>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-4 md:space-y-3 momentum-scroll mobile-chat-container">
      {messages.length === 0 && !isTyping && (
        <div className="text-center text-muted-foreground py-8 md:py-6">
          <p className="text-base md:text-sm mobile-chat-message">
            {isAiMode 
              ? "Ask me anything! I'm here to help with HR questions and workplace guidance."
              : "Start a conversation..."
            }
          </p>
        </div>
      )}

      {messages.map((message) => {
        // Check if this message is from the current employee (using sender_id comparison)
        const isOwnMessage = message.sender_id === currentEmployeeId && message.sender_type !== 'ai_bot';
        const isAiMessage = message.sender_type === 'ai_bot';

        console.log('ChatMessages: Rendering message', {
          messageId: message.id,
          senderId: message.sender_id,
          currentEmployeeId,
          isOwnMessage,
          isAiMessage,
          senderType: message.sender_type,
          messageContent: message.content.substring(0, 50) + '...'
        });

        return (
          <div key={message.id} className={`flex ${isAiMessage ? 'justify-start' : isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 md:mb-2`}>
            <div className="flex items-start gap-3 md:gap-2 max-w-[85%] md:max-w-[75%]">
              {!isOwnMessage && !isAiMessage && (
                <Avatar className="w-10 h-10 md:w-8 md:h-8 mt-1 flex-shrink-0">
                  <AvatarImage src={message.sender?.avatar_url} alt={message.sender?.name} />
                  <AvatarFallback className="text-sm md:text-xs">
                    {message.sender?.name?.split(' ')?.map(n => n[0])?.join('') || '?'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {isAiMessage && (
                <div className="w-10 h-10 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <Bot className="w-6 h-6 md:w-4 md:h-4 text-blue-600" />
                </div>
              )}
              
              <div className={`mobile-chat-bubble rounded-2xl px-4 py-3 md:px-3 md:py-2 shadow-sm ${
                isAiMessage 
                  ? 'bg-blue-50 text-blue-900 border border-blue-100' 
                  : isOwnMessage 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                {!isOwnMessage && !isAiMessage && message.sender && (
                  <p className="text-xs font-medium text-muted-foreground mb-2 md:mb-1">
                    {message.sender.name}
                  </p>
                )}
                
                <div className="space-y-2 mobile-chat-message">
                  {renderMessageContent(message)}
                </div>
                
                <p className="text-xs opacity-70 mt-2 md:mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex justify-start mb-3 md:mb-2">
          <div className="flex items-start gap-3 md:gap-2">
            <div className="w-10 h-10 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 md:w-4 md:h-4 text-blue-600" />
            </div>
            <div className="mobile-typing-indicator bg-muted rounded-2xl px-4 py-3 md:px-3 md:py-2 shadow-sm">
              <div className="mobile-typing-dot"></div>
              <div className="mobile-typing-dot"></div>
              <div className="mobile-typing-dot"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};