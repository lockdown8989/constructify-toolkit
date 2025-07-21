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

    // For admins, also get offline users from database
    if (['admin', 'employer', 'hr'].includes(currentUserRole)) {
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
    <div className="p-6 space-y-4">
      <h3 className="font-semibold text-center mb-6">Choose Chat Type</h3>
      
      <Button
        onClick={() => {
          setChatMode('ai');
          setMessages([]);
        }}
        className="w-full h-16 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 rounded-lg flex items-center gap-3"
        variant="outline"
      >
        <Bot className="w-6 h-6" />
        <div className="text-left">
          <div className="font-medium">AI Assistant</div>
          <div className="text-sm opacity-70">Get help with HR questions</div>
        </div>
      </Button>

      <Button
        onClick={() => setChatMode('human')}
        className="w-full h-16 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 rounded-lg flex items-center gap-3"
        variant="outline"
      >
        <Users className="w-6 h-6" />
        <div className="text-left">
          <div className="font-medium">Chat with Users</div>
          <div className="text-sm opacity-70">Connect with colleagues</div>
        </div>
      </Button>
    </div>
  );

  const renderUserSelection = () => (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Select User to Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetChat}
          className="p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {connectedUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
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
              className="w-full p-3 h-auto justify-start bg-muted/50 hover:bg-muted text-left"
              variant="ghost"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <Circle 
                    className={cn(
                      "w-3 h-3",
                      connectedUser.isOnline ? "text-green-500 fill-current" : "text-gray-400"
                    )} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{connectedUser.name}</div>
                  <div className="text-xs text-muted-foreground">
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
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold">
              {chatMode === 'ai' ? 'AI Assistant' : selectedUser?.name || 'Chat'}
            </h3>
            {chatMode === 'human' && selectedUser && (
              <Circle 
                className={cn(
                  "w-2 h-2 ml-1",
                  selectedUser.isOnline ? "text-green-500 fill-current" : "text-gray-400"
                )} 
              />
            )}
          </div>
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
            {chatMode === 'ai' 
              ? "Hi! I'm your AI assistant. How can I help you today?"
              : `Start a conversation with ${selectedUser?.name}`
            }
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAi || msg.sender === 'AI Assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs rounded-lg p-3 ${
                  msg.isAi || msg.sender === 'AI Assistant'
                    ? 'bg-muted text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {isLoading && chatMode === 'ai' && (
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
            onKeyPress={(e) => e.key === 'Enter' && (chatMode === 'ai' ? sendAiMessage() : sendHumanMessage())}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border rounded-md"
            disabled={isLoading}
          />
          <Button 
            size="sm" 
            onClick={chatMode === 'ai' ? sendAiMessage : sendHumanMessage}
            disabled={!message.trim() || isLoading || (chatMode === 'human' && !selectedUser)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-background border border-border rounded-lg shadow-lg z-50 flex flex-col md:w-96 md:h-[600px] sm:w-80 sm:h-[500px] xs:w-72 xs:h-[450px]">
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