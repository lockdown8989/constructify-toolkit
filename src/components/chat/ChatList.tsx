
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/hooks/use-chat';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  chats: Chat[];
  isLoading: boolean;
  onChatSelect: (chat: Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  isLoading,
  onChatSelect,
}) => {
  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Loading chats...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground text-sm">
          No conversations yet. Start a new chat to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => {
        // Determine the other participant in the chat
        const otherParticipant = chat.employee || chat.admin;
        
        return (
          <Button
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className="w-full p-4 h-auto justify-start hover:bg-muted/50 text-left border-b border-border/50"
            variant="ghost"
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={otherParticipant?.avatar_url} 
                  alt={otherParticipant?.name} 
                />
                <AvatarFallback className="text-sm">
                  {otherParticipant?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">
                    {otherParticipant?.name || 'Unknown User'}
                  </span>
                  {chat.last_message_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatLastMessageTime(chat.last_message_at)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Click to start conversation
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
