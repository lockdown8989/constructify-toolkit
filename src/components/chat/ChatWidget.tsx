import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Bot, Users, Circle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ConnectedUser {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

export const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'select' | 'ai' | 'human'>('select');
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, content: string, isAi: boolean, timestamp: string, sender?: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  console.log('ChatWidget: Rendering, user:', user, 'isOpen:', isOpen, 'chatMode:', chatMode);

  // Don't render if user is not authenticated
  if (!user) {
    console.log('ChatWidget: No user, not rendering');
    return null;
  }

  // Get current user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roles) {
        setCurrentUserRole(roles.role);
      }
    };
    
    fetchUserRole();
  }, [user.id]);

  // Track user presence and get connected users
  useEffect(() => {
    if (!isOpen || chatMode !== 'select') return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track current user presence
    channel.on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      console.log('Presence sync:', newState);
      updateConnectedUsers(newState);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    });

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;

      // Get current user info
      const { data: employee } = await supabase
        .from('employees')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      // Track presence
      await channel.track({
        user_id: user.id,
        name: employee?.name || 'Unknown User',
        role: currentUserRole,
        online_at: new Date().toISOString(),
      });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, chatMode, user.id, currentUserRole]);

  const updateConnectedUsers = async (presenceState: any) => {
    const users: ConnectedUser[] = [];
    
    // Get all users from presence state
    Object.keys(presenceState).forEach(userId => {
      const presences = presenceState[userId];
      if (presences.length > 0) {
        const presence = presences[0];
        if (userId !== user.id) { // Don't include current user
          users.push({
            id: userId,
            name: presence.name,
            role: presence.role,
            isOnline: true,
            lastSeen: presence.online_at,
          });
        }
      }
    });

    // Get all employees from database so everyone can chat with each other
    const { data: allEmployees } = await supabase
      .from('employees')
      .select(`
        user_id,
        name
      `)
      .neq('user_id', user.id);

    if (allEmployees) {
      // Get roles for all employees
      const userIds = allEmployees.map(emp => emp.user_id);
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      allEmployees.forEach(emp => {
        if (!users.find(u => u.id === emp.user_id)) {
          const userRole = userRoles?.find(r => r.user_id === emp.user_id);
          users.push({
            id: emp.user_id,
            name: emp.name,
            role: userRole?.role || 'employee',
            isOnline: false,
          });
        }
      });
    }

    setConnectedUsers(users);
  };

  const sendAiMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      content: message.trim(),
      isAi: false,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'You'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI:', currentMessage);
      
      const { data, error } = await supabase.functions.invoke('chat-ai-assistant', {
        body: {
          message: currentMessage,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      console.log('AI Response data:', data);
      console.log('AI Response error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const aiMessage = {
        id: crypto.randomUUID(),
        content: data.response || "I'm sorry, I couldn't process your request.",
        isAi: true,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'AI Assistant'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = {
        id: crypto.randomUUID(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        isAi: true,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'AI Assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendHumanMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    // This would integrate with the existing chat system for human-to-human messaging
    // For now, just add to local messages as a placeholder
    const userMessage = {
      id: crypto.randomUUID(),
      content: message.trim(),
      isAi: false,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'You'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
  };

  const resetChat = () => {
    setChatMode('select');
    setSelectedUser(null);
    setMessages([]);
    setMessage('');
  };

  const renderChatModeSelection = () => (
    <div className="p-6 md:p-6 space-y-4 md:space-y-4 safe-area-inset">
      <div className="flex items-center justify-between mb-6 md:mb-6">
        <h3 className="font-semibold text-lg md:text-lg">Choose Chat Type</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="p-2 h-auto touch-manipulation md:hidden"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <Button
        onClick={() => {
          setChatMode('ai');
          setMessages([]);
        }}
        className="w-full h-16 md:h-16 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 rounded-xl flex items-center gap-4 text-left touch-manipulation active:scale-[0.98] transition-transform"
        variant="outline"
      >
        <Bot className="w-7 h-7 md:w-6 md:h-6 flex-shrink-0" />
        <div className="text-left">
          <div className="font-semibold text-base md:text-base">AI Assistant</div>
          <div className="text-sm md:text-sm opacity-70">Get help with HR questions</div>
        </div>
      </Button>

      <Button
        onClick={() => setChatMode('human')}
        className="w-full h-16 md:h-16 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 rounded-xl flex items-center gap-4 text-left touch-manipulation active:scale-[0.98] transition-transform"
        variant="outline"
      >
        <Users className="w-7 h-7 md:w-6 md:h-6 flex-shrink-0" />
        <div className="text-left">
          <div className="font-semibold text-base md:text-base">Chat with Users</div>
          <div className="text-sm md:text-sm opacity-70">Connect with colleagues</div>
        </div>
      </Button>
    </div>
  );

  const renderUserSelection = () => (
    <div className="p-4 md:p-4 h-full flex flex-col safe-area-inset">
      <div className="flex items-center justify-between mb-4 md:mb-4">
        <h3 className="font-semibold text-lg md:text-base">Select User to Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetChat}
          className="p-3 h-auto touch-manipulation"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {connectedUsers.length === 0 ? (
          <p className="text-xs md:text-sm text-muted-foreground text-center py-6 md:py-8">
            No users available to chat with
          </p>
        ) : (
          connectedUsers.map((connectedUser) => (
            <Button
              key={connectedUser.id}
              onClick={() => {
                setSelectedUser(connectedUser);
                setMessages([]);
              }}
              className="w-full p-4 md:p-4 h-auto justify-start bg-muted/50 hover:bg-muted text-left touch-manipulation min-h-[64px] rounded-xl active:scale-[0.98] transition-transform"
              variant="ghost"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <Circle 
                    className={cn(
                      "w-3 h-3 md:w-4 md:h-4",
                      connectedUser.isOnline ? "text-green-500 fill-current" : "text-gray-400"
                    )} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm md:text-base">{connectedUser.name}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {connectedUser.role} • {connectedUser.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );

  const renderChatInterface = () => (
    <>
      <div className="p-4 md:p-4 bg-muted/50 border-b safe-area-inset-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="p-2 h-auto touch-manipulation"
            >
              <X className="w-5 h-5" />
            </Button>
            <h3 className="font-semibold text-lg md:text-base truncate">
              {chatMode === 'ai' ? 'AI Assistant' : selectedUser?.name || 'Chat'}
            </h3>
            {chatMode === 'human' && selectedUser && (
              <Circle 
                className={cn(
                  "w-3 h-3 md:w-3 md:h-3 ml-1 flex-shrink-0",
                  selectedUser.isOnline ? "text-green-500 fill-current" : "text-gray-400"
                )} 
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="p-2 h-auto touch-manipulation md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 md:p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-xs md:text-sm text-muted-foreground">
            {chatMode === 'ai' 
              ? "Hi! I'm your AI assistant. How can I help you today?"
              : `Start a conversation with ${selectedUser?.name}`
            }
          </p>
        ) : (
          <div className="space-y-4 md:space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAi || msg.sender === 'AI Assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] md:max-w-xs rounded-2xl p-4 md:p-4 ${
                  msg.isAi || msg.sender === 'AI Assistant'
                    ? 'bg-muted text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm md:text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-2 md:mt-2">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {isLoading && chatMode === 'ai' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 md:p-4">
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
      
      <div className="p-4 md:p-4 border-t bg-background safe-area-inset-bottom">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (chatMode === 'ai' ? sendAiMessage() : sendHumanMessage())}
            placeholder="Type your message..."
            className="flex-1 px-4 py-4 md:py-3 text-base md:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation"
            disabled={isLoading}
          />
          <Button 
            size="sm" 
            onClick={chatMode === 'ai' ? sendAiMessage : sendHumanMessage}
            disabled={!message.trim() || isLoading || (chatMode === 'human' && !selectedUser)}
            className="px-4 py-4 md:py-3 touch-manipulation rounded-xl min-w-[56px]"
          >
            <Send className="w-5 h-5 md:w-4 md:h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "fixed bg-background border shadow-lg z-50 flex flex-col",
          // Desktop
          "md:bottom-20 md:right-4 md:w-96 md:h-[600px] md:rounded-lg md:border-border",
          // Mobile - full screen experience
          "max-md:inset-0 max-md:w-full max-md:h-full max-md:rounded-none max-md:border-0"
        )}>
          {chatMode === 'select' && renderChatModeSelection()}
          {chatMode === 'human' && !selectedUser && renderUserSelection()}
          {((chatMode === 'ai') || (chatMode === 'human' && selectedUser)) && renderChatInterface()}
        </div>
      )}

      {/* Chat Toggle Button */}
      <Button
        onClick={() => {
          console.log('ChatWidget: Button clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
          if (!isOpen) {
            resetChat();
          }
        }}
        className={cn(
          "fixed shadow-lg z-40 p-0 touch-manipulation",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-200 ease-in-out rounded-full",
          // Desktop
          "md:bottom-4 md:right-4 md:w-14 md:h-14",
          // Mobile - larger touch target, better positioning
          "max-md:bottom-6 max-md:right-4 max-md:w-16 max-md:h-16"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 md:w-6 md:h-6" />
        ) : (
          <MessageCircle className="w-6 h-6 md:w-6 md:h-6" />
        )}
      </Button>
    </>
  );
};