import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
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
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start a new chat to get help!</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {chats.map((chat) => {
        const participant = chat.employee || chat.admin;
        const lastMessageTime = chat.last_message_at 
          ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })
          : 'No messages';

        return (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className={cn(
              "flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b border-border/50 transition-colors"
            )}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={participant?.avatar_url} />
              <AvatarFallback className="text-sm">
                {participant?.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate">
                  {participant?.name}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {lastMessageTime}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {chat.last_message_at ? 'Recent activity' : 'No messages'}
                </p>
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};