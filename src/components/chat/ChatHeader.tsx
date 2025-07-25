
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Bot, Users } from 'lucide-react';
import { Chat } from '@/hooks/use-chat';

interface ChatHeaderProps {
  chat: Chat | null;
  isAiMode: boolean;
  onBack: () => void;
  onToggleMode: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  isAiMode,
  onBack,
  onToggleMode,
}) => {
  const otherParticipant = chat?.employee || chat?.admin;

  return (
    <div className="p-4 border-b border-border bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {isAiMode ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold">AI Assistant</span>
            </div>
          ) : otherParticipant ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={otherParticipant.avatar_url} alt={otherParticipant.name} />
                <AvatarFallback className="text-xs">
                  {otherParticipant.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">{otherParticipant.name}</span>
            </div>
          ) : (
            <span className="font-semibold">Chat</span>
          )}
        </div>

        {chat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMode}
            className="p-2 h-auto"
            title={isAiMode ? "Switch to human chat" : "Switch to AI assistant"}
          >
            {isAiMode ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};
