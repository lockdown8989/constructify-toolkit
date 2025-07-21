import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Users, ArrowLeft } from 'lucide-react';
import { Chat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  chat?: Chat | null;
  isAiMode: boolean;
  onToggleAiMode: () => void;
  onBack: () => void;
  userRole: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  isAiMode,
  onToggleAiMode,
  onBack,
  userRole,
}) => {
  const isAdmin = ['admin', 'employer', 'hr'].includes(userRole);
  const participant = isAdmin ? chat?.employee : chat?.admin;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
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
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask me anything!</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={participant?.avatar_url} />
              <AvatarFallback className="text-xs">
                {participant?.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{participant?.name}</h3>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleAiMode}
        className={cn(
          "p-2 h-auto",
          isAiMode && "bg-primary/10 text-primary"
        )}
        title={isAiMode ? "Switch to human chat" : "Switch to AI assistant"}
      >
        {isAiMode ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </Button>
    </div>
  );
};