import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Bot, Users, Circle, Bell, Power } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ConnectedUser {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
  avatar_url?: string;
}

export const ChatWidget = () => {
  const { user } = useAuth();
  const {
    currentChat,
    messages: chatMessages,
    isLoading: chatLoading,
    isTyping,
    isAiMode,
    setCurrentChat,
    setIsAiMode,
    createOrGetChat,
    sendMessage: sendChatMessage,
    sendAiMessage,
    clearMessages,
    messagesEndRef,
    currentEmployee
  } = useChat();
  
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'select' | 'ai' | 'human'>('select');
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [message, setMessage] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [presenceChannel, setPresenceChannel] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  console.log('ChatWidget: Rendering, user:', user, 'isOpen:', isOpen, 'chatMode:', chatMode);

  // Don't render if user is not authenticated
  if (!user) {
    console.log('ChatWidget: No user, not rendering');
    return null;
  }

  // Get current user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: roleRow, error: roleErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleErr) {
        console.warn('ChatWidget: role lookup returned no/ambiguous rows; defaulting to employee', roleErr);
      }
      if (roleRow?.role) {
        setCurrentUserRole(roleRow.role);
      } else {
        setCurrentUserRole('employee');
      }
    };
    
    fetchUserRole();
  }, [user.id]);

  // Track user presence and get connected users
  useEffect(() => {
    if (!user || !currentUserRole) return;

    console.log('ChatWidget: Setting up presence for user:', user.id, 'with role:', currentUserRole);

    const setupPresence = async () => {
      // Get current user info first
      const { data: employee, error: empErr } = await supabase
        .from('employees')
        .select('id, name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (empErr || !employee) {
        console.log('ChatWidget: No employee found for user; skipping presence setup', empErr);
        return;
      }

      // Update user presence in database
      const { error: presenceError } = await supabase.rpc('upsert_user_presence', {
        p_user_id: user.id,
        p_employee_id: employee.id,
        p_is_online: isOnline,
        p_socket_id: null
      });

      if (presenceError) {
        console.error('ChatWidget: Error updating presence:', presenceError);
      } else {
        console.log('ChatWidget: Presence updated successfully');
      }
    };

    setupPresence();

    // Set up real-time subscription for user presence updates
    const presenceChannel = supabase
      .channel('user-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('ChatWidget: Presence change detected:', payload);
          updateConnectedUsers();
        }
      )
      .subscribe();

    setPresenceChannel(presenceChannel);

    return () => {
      console.log('ChatWidget: Cleaning up presence channel');
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [user.id, currentUserRole, isOnline]);

  const updateConnectedUsers = async () => {
    console.log('ChatWidget: Updating connected users from database');
    
    // Get all employees with their presence status
    const { data: employeesWithPresence } = await supabase
      .from('employees')
      .select(`
        user_id,
        name,
        avatar_url,
        user_presence(is_online, last_seen)
      `)
      .neq('user_id', user.id)
      .not('user_id', 'is', null);

    if (!employeesWithPresence) {
      console.log('ChatWidget: No employees found');
      setConnectedUsers([]);
      return;
    }

    // Get roles for all employees
    const userIds = employeesWithPresence.map(emp => emp.user_id);
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    // Create users list with correct online status from database
    const users: ConnectedUser[] = employeesWithPresence.map(emp => {
      const userRole = userRoles?.find(r => r.user_id === emp.user_id);
      const presenceData = emp.user_presence?.[0];
      
      return {
        id: emp.user_id,
        name: emp.name,
        role: userRole?.role || 'employee',
        isOnline: presenceData?.is_online || false,
        lastSeen: presenceData?.last_seen,
        avatar_url: emp.avatar_url,
      };
    });

    console.log('ChatWidget: Final connected users list:', users);
    setConnectedUsers(users);
  };

  // Initial load of all users when widget opens
  useEffect(() => {
    if (isOpen && chatMode === 'select') {
      updateConnectedUsers();
    }
  }, [isOpen, chatMode]);

  // Listen for new messages to update unread count
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Only count messages from other users
          if (payload.new.sender_id !== currentChat?.employee_id && !isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentChat, isOpen]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Update presence when online status changes
  useEffect(() => {
    if (user && currentUserRole) {
      const updatePresence = async () => {
        const { data: employee, error: empErr } = await supabase
          .from('employees')
          .select('id, name, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (employee) {
          const { error } = await supabase.rpc('upsert_user_presence', {
            p_user_id: user.id,
            p_employee_id: employee.id,
            p_is_online: isOnline,
            p_socket_id: null
          });

          if (error) {
            console.error('ChatWidget: Error updating presence status:', error);
          } else {
            console.log('ChatWidget: Updated presence status to:', isOnline);
          }
        }
      };
      
      updatePresence();
    }
  }, [isOnline, user, currentUserRole]);

  const handleSendAiMessage = async () => {
    if (!message.trim()) return;
    
    await sendAiMessage(message.trim());
    setMessage('');
  };

  const handleSendHumanMessage = async () => {
    if (!message.trim() || !currentChat) return;

    console.log('ChatWidget: Sending human message:', message, 'to chat:', currentChat.id);
    await sendChatMessage(message.trim());
    setMessage('');
  };

  const resetChat = () => {
    setChatMode('select');
    setSelectedUser(null);
    setCurrentChat(null);
    clearMessages();
    setMessage('');
    setIsAiMode(false);
  };

  const renderChatModeSelection = () => (
    <div className="p-6 md:p-6 space-y-6 md:space-y-4 safe-area-inset">
      <div className="flex items-center justify-between mb-8 md:mb-6">
        <h2 className="font-bold text-xl md:text-lg text-foreground">Choose Chat Type</h2>
        <div className="flex items-center gap-3">
          {/* Online/Offline Toggle Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={cn(
                "relative inline-flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out touch-manipulation min-w-[100px] h-10",
                isOnline 
                  ? "bg-green-500 text-white" 
                  : "bg-red-500 text-white"
              )}
            >
              <span className={cn(
                "absolute w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm",
                isOnline ? "transform translate-x-0" : "transform translate-x-8"
              )} />
              <span className="text-sm font-medium relative z-10 mx-auto">
                {isOnline ? "Online" : "Offline"}
              </span>
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="p-3 h-auto touch-manipulation md:hidden rounded-full hover:bg-muted/50"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>
      
      <Button
        onClick={() => {
          setChatMode('ai');
          setIsAiMode(true);
          clearMessages();
        }}
        className="w-full h-20 md:h-16 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 rounded-2xl flex items-center gap-5 text-left touch-manipulation active:scale-[0.97] transition-all duration-150 shadow-sm hover:shadow-md"
        variant="outline"
      >
        <div className="w-12 h-12 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bot className="w-7 h-7 md:w-6 md:h-6 text-blue-600" />
        </div>
        <div className="text-left flex-1">
          <div className="font-bold text-lg md:text-base text-blue-800">AI Assistant</div>
          <div className="text-sm md:text-sm text-blue-600 mt-1">Get help with HR questions</div>
        </div>
      </Button>

      <Button
        onClick={() => setChatMode('human')}
        className="w-full h-20 md:h-16 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 rounded-2xl flex items-center gap-5 text-left touch-manipulation active:scale-[0.97] transition-all duration-150 shadow-sm hover:shadow-md"
        variant="outline"
      >
        <div className="w-12 h-12 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Users className="w-7 h-7 md:w-6 md:h-6 text-green-600" />
        </div>
        <div className="text-left flex-1">
          <div className="font-bold text-lg md:text-base text-green-800">Chat with Users</div>
          <div className="text-sm md:text-sm text-green-600 mt-1">Connect with colleagues</div>
        </div>
      </Button>
    </div>
  );

  const renderUserSelection = () => (
    <div className="p-6 md:p-4 h-full flex flex-col safe-area-inset">
      <div className="flex items-center justify-between mb-6 md:mb-4">
        <h2 className="font-bold text-xl md:text-base text-foreground">Select User to Chat</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetChat}
          className="p-3 h-auto touch-manipulation rounded-full hover:bg-muted/50"
        >
          <X className="w-6 h-6 md:w-5 md:h-5" />
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
              onClick={async () => {
                console.log('ChatWidget: Starting chat with user:', connectedUser);
                setSelectedUser(connectedUser);
                setChatMode('human');
                // Get employee ID for the selected user
                const { data: employee, error: empErr } = await supabase
                  .from('employees')
                  .select('id')
                  .eq('user_id', connectedUser.id)
                  .maybeSingle();
                  
                console.log('ChatWidget: Found employee for user:', employee);
                if (employee) {
                  const chat = await createOrGetChat(employee.id);
                  console.log('ChatWidget: Created/got chat:', chat);
                }
              }}
              className="w-full p-4 md:p-4 h-auto justify-start bg-muted/50 hover:bg-muted text-left touch-manipulation min-h-[72px] rounded-xl active:scale-[0.98] transition-transform"
              variant="ghost"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="relative">
                  <Avatar className="w-12 h-12 md:w-10 md:h-10">
                    <AvatarImage 
                      src={connectedUser.avatar_url || ''} 
                      alt={connectedUser.name} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {connectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Circle 
                    className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 md:w-3 md:h-3 bg-background rounded-full border-2 border-background",
                      connectedUser.isOnline ? "text-green-500 fill-current" : "text-gray-400 fill-current"
                    )} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-base md:text-sm">{connectedUser.name}</div>
                  <div className="text-sm md:text-xs text-muted-foreground capitalize">
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
        {chatMessages.length === 0 ? (
          <p className="text-xs md:text-sm text-muted-foreground">
            {chatMode === 'ai' 
              ? "Hi! I'm your AI assistant. How can I help you today?"
              : `Start a conversation with ${selectedUser?.name}`
            }
          </p>
        ) : (
          <div className="space-y-4 md:space-y-4">
            {chatMessages.map((msg) => {
              // Determine if this message was sent by the current user
              const isCurrentUser = msg.sender_id === currentEmployee?.id;
              
              return (
                <div key={msg.id} className={`flex ${msg.sender_type === 'ai_bot' ? 'justify-start' : isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] md:max-w-xs rounded-2xl p-4 md:p-4 ${
                    msg.sender_type === 'ai_bot'
                      ? 'bg-muted text-foreground' 
                      : isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <p className="text-sm md:text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-2 md:mt-2">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                    {msg.sender && msg.sender_type !== 'ai_bot' && (
                      <p className="text-xs opacity-60 mt-1">
                        {msg.sender.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {(chatLoading || isTyping) && (
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
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 md:p-4 border-t bg-background safe-area-inset-bottom">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (chatMode === 'ai' ? handleSendAiMessage() : handleSendHumanMessage())}
            placeholder="Type your message..."
            className="flex-1 px-4 py-4 md:py-3 text-base md:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation"
            disabled={chatLoading || isTyping}
          />
          <Button 
            size="sm" 
            onClick={chatMode === 'ai' ? handleSendAiMessage : handleSendHumanMessage}
            disabled={!message.trim() || chatLoading || isTyping || (chatMode === 'human' && !currentChat)}
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
          {chatMode === 'ai' && renderChatInterface()}
          {chatMode === 'human' && selectedUser && renderChatInterface()}
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
          "max-md:bottom-6 max-md:right-6 max-md:w-16 max-md:h-16"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 md:w-6 md:h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 md:w-6 md:h-6" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </>
        )}
      </Button>
    </>
  );
};
