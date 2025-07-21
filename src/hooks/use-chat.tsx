import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'ai_response';
  sender_type: 'human_admin' | 'human_employee' | 'ai_bot';
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Chat {
  id: string;
  employee_id: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  is_active: boolean;
  employee?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  admin?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export const useChat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current employee and role
  useEffect(() => {
    const fetchCurrentEmployee = async () => {
      if (!user) {
        console.log('Chat: No user found');
        return;
      }

      try {
        console.log('Chat: Fetching employee for user:', user.id);
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (employeeError) {
          console.error('Chat: Error fetching employee:', employeeError);
          return;
        }

        console.log('Chat: Employee fetched:', employee);
        setCurrentEmployee(employee);

        const { data: role, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Chat: Error fetching role:', roleError);
          setUserRole('employee'); // Default fallback
          return;
        }

        console.log('Chat: User role:', role?.role);
        setUserRole(role?.role || 'employee');
      } catch (error) {
        console.error('Chat: Error in fetchCurrentEmployee:', error);
      }
    };

    fetchCurrentEmployee();
  }, [user]);

  // Fetch chats
  const fetchChats = async () => {
    if (!currentEmployee) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          employee:employees!chats_employee_id_fkey(id, name, avatar_url),
          admin:employees!chats_admin_id_fkey(id, name, avatar_url)
        `)
        .or(`employee_id.eq.${currentEmployee.id},admin_id.eq.${currentEmployee.id}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for current chat
  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:employees(id, name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', currentEmployee?.id);

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Create or get chat with admin/employee
  const createOrGetChat = async (targetEmployeeId: string) => {
    if (!currentEmployee) return null;

    try {
      // Determine admin and employee IDs based on current user role
      const isAdmin = ['admin', 'employer', 'hr'].includes(userRole);
      const adminId = isAdmin ? currentEmployee.id : targetEmployeeId;
      const employeeId = isAdmin ? targetEmployeeId : currentEmployee.id;

      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select(`
          *,
          employee:employees!chats_employee_id_fkey(id, name, avatar_url),
          admin:employees!chats_admin_id_fkey(id, name, avatar_url)
        `)
        .eq('employee_id', employeeId)
        .eq('admin_id', adminId)
        .eq('is_active', true)
        .single();

      if (existingChat) {
        setCurrentChat(existingChat);
        await fetchMessages(existingChat.id);
        return existingChat;
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          employee_id: employeeId,
          admin_id: adminId,
        })
        .select(`
          *,
          employee:employees!chats_employee_id_fkey(id, name, avatar_url),
          admin:employees!chats_admin_id_fkey(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setCurrentChat(newChat);
      setMessages([]);
      await fetchChats(); // Refresh chats list
      return newChat;

    } catch (error) {
      console.error('Error creating/getting chat:', error);
      toast.error('Failed to start chat');
      return null;
    }
  };

  // Send message
  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text', attachmentData?: any) => {
    if (!currentChat || !currentEmployee || !content.trim()) return;

    try {
      const senderType = ['admin', 'employer', 'hr'].includes(userRole) ? 'human_admin' : 'human_employee';

      const messageData = {
        chat_id: currentChat.id,
        sender_id: currentEmployee.id,
        content: content.trim(),
        message_type: messageType,
        sender_type: senderType,
        ...(attachmentData && {
          attachment_url: attachmentData.url,
          attachment_name: attachmentData.name,
          attachment_size: attachmentData.size,
        }),
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:employees(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Add message to local state immediately
      setMessages(prev => [...prev, data]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Send AI message
  const sendAiMessage = async (content: string) => {
    if (!currentEmployee || !content.trim()) return;

    try {
      setIsTyping(true);

      // Get conversation history for context (use current messages or empty array)
      const conversationHistory = messages.slice(-10); // Last 10 messages for context

      const { data, error } = await supabase.functions.invoke('chat-ai-assistant', {
        body: {
          message: content.trim(),
          conversationHistory
        }
      });

      if (error) {
        console.error('AI function error:', error);
        throw error;
      }

      if (!data?.response) {
        throw new Error('No response from AI');
      }

      // For standalone AI chat, create temporary message objects
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        chat_id: 'ai-standalone',
        sender_id: currentEmployee.id,
        content: content.trim(),
        message_type: 'text',
        sender_type: ['admin', 'employer', 'hr'].includes(userRole) ? 'human_admin' : 'human_employee',
        is_read: true,
        created_at: new Date().toISOString(),
        sender: {
          id: currentEmployee.id,
          name: currentEmployee.name,
          avatar_url: currentEmployee.avatar_url
        }
      };

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        chat_id: 'ai-standalone',
        sender_id: 'ai-bot',
        content: data.response,
        message_type: 'ai_response',
        sender_type: 'ai_bot',
        is_read: true,
        created_at: new Date().toISOString(),
        sender: {
          id: 'ai-bot',
          name: 'AI Assistant',
          avatar_url: undefined
        }
      };

      // Add both messages to local state
      setMessages(prev => [...prev, userMessage, aiMessage]);

    } catch (error) {
      console.error('Error sending AI message:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  // Upload file
  const uploadFile = async (file: File) => {
    if (!currentEmployee || !user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        name: file.name,
        size: file.size,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentEmployee) return;

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Only add message if it's for current chat and not from current user
          if (newMessage.chat_id === currentChat?.id && newMessage.sender_id !== currentEmployee.id) {
            setMessages(prev => {
              // Check if message already exists
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }

          // Update chats list
          fetchChats();
        }
      )
      .subscribe();

    const chatsChannel = supabase
      .channel('chats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [currentEmployee, currentChat?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial fetch
  useEffect(() => {
    if (currentEmployee) {
      fetchChats();
    }
  }, [currentEmployee]);

  return {
    chats,
    currentChat,
    messages,
    isLoading,
    isTyping,
    isAiMode,
    userRole,
    currentEmployee,
    messagesEndRef,
    setCurrentChat: (chat: Chat | null) => {
      setCurrentChat(chat);
      if (chat) {
        fetchMessages(chat.id);
      } else {
        setMessages([]);
      }
    },
    setIsAiMode,
    clearMessages: () => setMessages([]),
    createOrGetChat,
    sendMessage,
    sendAiMessage,
    uploadFile,
    refreshChats: fetchChats,
  };
};