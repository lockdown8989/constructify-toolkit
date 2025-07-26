
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Paperclip, Bot, Users, Search } from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';
import { EmployeeSearch } from './EmployeeSearch';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const {
    chats,
    currentChat,
    messages,
    isLoading,
    isTyping,
    isAiMode,
    userRole,
    currentEmployee,
    setCurrentChat,
    setIsAiMode,
    createOrGetChat,
    sendMessage,
    sendAiMessage,
    uploadFile,
    clearMessages,
  } = useChat();

  console.log('ChatWindow: Hook values:', { 
    currentEmployee, 
    userRole, 
    isLoading,
    isAiMode,
    currentChatId: currentChat?.id
  });

  const [view, setView] = useState<'chats' | 'chat' | 'search' | 'ai'>('chats');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartChat = async (employeeId: string) => {
    const chat = await createOrGetChat(employeeId);
    if (chat) {
      setView('chat');
    }
  };

  const handleBackToChats = () => {
    setCurrentChat(null);
    setView('chats');
    setIsAiMode(false);
  };

  const handleStartAiChat = () => {
    clearMessages(); // Clear any existing messages
    setView('ai');
    setIsAiMode(true);
  };

  const isAdmin = ['admin', 'employer', 'hr'].includes(userRole);

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          {(view === 'chat' || view === 'search' || view === 'ai') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToChats}
              className="p-1 h-auto"
            >
              ←
            </Button>
          )}
          <h3 className="font-semibold text-sm">
            {view === 'chats' && 'Messages'}
            {view === 'chat' && (
              isAiMode ? 'AI Assistant' : 
              currentChat?.employee?.name || currentChat?.admin?.name || 'Chat'
            )}
            {view === 'search' && 'Start New Chat'}
            {view === 'ai' && 'AI Assistant'}
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          {view === 'chats' && (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('search')}
                  className="p-1 h-auto"
                  title="Start new chat"
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartAiChat}
                className="p-1 h-auto"
                title="Start AI assistant chat"
              >
                <Bot className="w-4 h-4" />
              </Button>
            </>
          )}
          
          {view === 'chat' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAiMode(!isAiMode)}
              className={cn(
                "p-1 h-auto",
                isAiMode && "bg-primary/10 text-primary"
              )}
              title={isAiMode ? "Switch to human chat" : "Switch to AI assistant"}
            >
              {isAiMode ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'chats' && (
          <ChatList
            chats={chats}
            isLoading={isLoading}
            onChatSelect={(chat) => {
              setCurrentChat(chat);
              setView('chat');
            }}
          />
        )}

        {view === 'search' && (
          <EmployeeSearch
            onEmployeeSelect={handleStartChat}
            onBack={() => setView('chats')}
          />
        )}

        {view === 'chat' && currentChat && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <ChatMessages
                messages={messages}
                isTyping={isTyping}
                isAiMode={isAiMode}
                currentEmployeeId={currentEmployee?.id || ''}
              />
            </div>
            
            <div className="p-3 border-t border-border">
              <ChatInput
                onSendMessage={isAiMode ? sendAiMessage : sendMessage}
                onUploadFile={uploadFile}
                isAiMode={isAiMode}
                disabled={isTyping}
              />
            </div>
          </div>
        )}

        {view === 'ai' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <ChatMessages
                messages={messages}
                isTyping={isTyping}
                isAiMode={true}
                currentEmployeeId={currentEmployee?.id || ''}
              />
            </div>
            
            <div className="p-3 border-t border-border">
              <ChatInput
                onSendMessage={sendAiMessage}
                isAiMode={true}
                disabled={isTyping}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
