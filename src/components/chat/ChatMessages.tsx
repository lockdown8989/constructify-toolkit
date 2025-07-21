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
  currentUserId: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isTyping,
  isAiMode,
  currentUserId,
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
            <p className="text-sm">{message.content}</p>
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
            <p className="text-sm">{message.content}</p>
          )}
          <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/50">
            <Download className="w-4 h-4 text-muted-foreground" />
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
              className="text-xs text-primary hover:underline"
            >
              Download
            </a>
          </div>
        </div>
      );
    }

    return <p className="text-sm">{message.content}</p>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isTyping && (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">
            {isAiMode 
              ? "Ask me anything! I'm here to help with HR questions and workplace guidance."
              : "Start a conversation..."
            }
          </p>
        </div>
      )}

      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId && message.sender_type !== 'ai_bot';
        const isAiMessage = message.sender_type === 'ai_bot';

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              isOwnMessage && !isAiMessage && "flex-row-reverse"
            )}
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              {isAiMessage ? (
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              ) : (
                <>
                  <AvatarImage src={message.sender?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {message.sender?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </>
              )}
            </Avatar>

            <div className={cn(
              "flex-1 space-y-1",
              isOwnMessage && !isAiMessage && "flex flex-col items-end"
            )}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">
                  {isAiMessage ? 'AI Assistant' : message.sender?.name}
                </span>
                {isAiMessage && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    AI
                  </Badge>
                )}
              </div>

              <div className={cn(
                "max-w-[70%] rounded-lg p-3",
                isOwnMessage && !isAiMessage
                  ? "bg-primary text-primary-foreground"
                  : isAiMessage
                  ? "bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                  : "bg-muted"
              )}>
                {renderMessageContent(message)}
              </div>

              <p className={cn(
                "text-xs text-muted-foreground",
                isOwnMessage && !isAiMessage && "text-right"
              )}>
                {formatMessageTime(message.created_at)}
              </p>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};