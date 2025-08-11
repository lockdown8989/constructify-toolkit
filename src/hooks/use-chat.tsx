import { useState, useEffect, useRef } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
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

  const fetchChats = async () => {
    if (!currentEmployee) return;

    try {
      setIsLoading(true);
      console.log('Chat: Fetching chats for employee:', currentEmployee.id);
      
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

      if (error) {
        console.error('Chat: Error fetching chats:', error);
        throw error;
      }
      
      console.log('Chat: Chats fetched:', data);
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      console.log('Chat: Fetching messages for chat:', chatId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:employees(id, name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Chat: Error fetching messages:', error);
        throw error;
      }
      
      console.log('Chat: Messages fetched:', data);
      setMessages(data || []);

      // Mark messages as read for current user
      if (currentEmployee) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('chat_id', chatId)
          .neq('sender_id', currentEmployee.id);

        if (updateError) {
          console.error('Chat: Error marking messages as read:', updateError);
        } else {
          console.log('Chat: Messages marked as read for current employee:', currentEmployee.id);
        }
      }

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const createOrGetChat = async (targetEmployeeId: string) => {
    if (!currentEmployee) {
      console.error('Chat: No current employee found');
      return null;
    }

    try {
      console.log('Chat: Creating or getting chat between:', currentEmployee.id, 'and', targetEmployeeId);
      
      // Determine admin and employee IDs based on current user role
      const isAdmin = ['admin', 'employer', 'hr'].includes(userRole);
      const adminId = isAdmin ? currentEmployee.id : targetEmployeeId;
      const employeeId = isAdmin ? targetEmployeeId : currentEmployee.id;

      console.log('Chat: Admin ID:', adminId, 'Employee ID:', employeeId, 'Is current user admin:', isAdmin);

      // Check if chat already exists (check both directions to prevent duplicates)
      const { data: existingChat, error: existingError } = await supabase
        .from('chats')
        .select(`
          *,
          employee:employees!chats_employee_id_fkey(id, name, avatar_url),
          admin:employees!chats_admin_id_fkey(id, name, avatar_url)
        `)
        .or(`and(employee_id.eq.${employeeId},admin_id.eq.${adminId}),and(employee_id.eq.${adminId},admin_id.eq.${employeeId})`)
        .eq('is_active', true)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Chat: Error checking existing chat:', existingError);
        throw existingError;
      }

      if (existingChat) {
        console.log('Chat: Found existing chat:', existingChat);
        setCurrentChat(existingChat);
        await fetchMessages(existingChat.id);
        return existingChat;
      }

      // Create new chat
      console.log('Chat: Creating new chat with employee_id:', employeeId, 'admin_id:', adminId);
      const { data: newChat, error: createError } = await supabase
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

      if (createError) {
        console.error('Chat: Error creating chat:', createError);
        throw createError;
      }

      console.log('Chat: New chat created:', newChat);
      setCurrentChat(newChat);
      setMessages([]);
      await fetchChats(); // Refresh chats list
      return newChat;

    } catch (error) {
      console.error('Error creating/getting chat:', error);
      toast.error('Failed to start chat. Please try again.');
      return null;
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text', attachmentData?: any) => {
    if (!currentChat || !currentEmployee || !content.trim()) {
      console.error('Chat: Cannot send message - missing requirements:', {
        currentChat: !!currentChat,
        currentEmployee: !!currentEmployee,
        content: content.trim()
      });
      return;
    }

    try {
      console.log('Chat: Sending message from employee:', currentEmployee.id, 'in chat:', currentChat.id);
      
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

      console.log('Chat: Message data to send:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:employees(id, name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Chat: Error sending message:', error);
        throw error;
      }

      console.log('Chat: Message sent successfully:', data);

      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, data]);

      // Update chat's last_message_at
      const { error: updateError } = await supabase
        .from('chats')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentChat.id);

      if (updateError) {
        console.error('Chat: Error updating chat timestamp:', updateError);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

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

      // Always show the user's message first
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

      // Try a direct fetch fallback to the Edge Function (some environments block invoke)
      try {
        const conversationHistory = messages.slice(-10);
        const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-ai-assistant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message: content.trim(), conversationHistory })
        });

        const json = await res.json().catch(() => null);
        if (res.ok && json?.response) {
          const aiMessage: ChatMessage = {
            id: crypto.randomUUID(),
            chat_id: 'ai-standalone',
            sender_id: 'ai-bot',
            content: json.response,
            message_type: 'ai_response',
            sender_type: 'ai_bot',
            is_read: true,
            created_at: new Date().toISOString(),
            sender: { id: 'ai-bot', name: 'AI Assistant', avatar_url: undefined }
          };
          setMessages(prev => [...prev, userMessage, aiMessage]);
          return; // Stop here since we succeeded
        }
      } catch (directErr) {
        console.error('Direct edge function fetch failed:', directErr);
      }

      // Final graceful fallback so the user always gets an answer
      const aiFallback: ChatMessage = {
        id: crypto.randomUUID(),
        chat_id: 'ai-standalone',
        sender_id: 'ai-bot',
        content: "I'm having trouble reaching the AI service right now, but I still understood your request. Try again in a moment or be more specific (date, shift times, employee).",
        message_type: 'ai_response',
        sender_type: 'ai_bot',
        is_read: true,
        created_at: new Date().toISOString(),
        sender: { id: 'ai-bot', name: 'AI Assistant', avatar_url: undefined }
      };

      setMessages(prev => [...prev, userMessage, aiFallback]);
    } finally {
      setIsTyping(false);
    }
  };

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

  useEffect(() => {
    if (!currentEmployee) {
      console.log('Chat: No current employee, skipping real-time setup');
      return;
    }

    console.log('Chat: Setting up real-time subscriptions for employee:', currentEmployee.id);

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
          console.log('Chat: Received new message via real-time:', payload);
          const newMessage = payload.new as ChatMessage;
          
          // Only add message if it's for the current chat
          if (currentChat && newMessage.chat_id === currentChat.id) {
            console.log('Chat: Processing message for current chat:', newMessage.chat_id);
            
            // Fetch sender info for the new message
            const fetchSenderInfo = async () => {
              const { data: sender } = await supabase
                .from('employees')
                .select('id, name, avatar_url')
                .eq('id', newMessage.sender_id)
                .single();
              
              const messageWithSender = {
                ...newMessage,
                sender: sender || { id: newMessage.sender_id, name: 'Unknown User', avatar_url: null }
              };
              
              setMessages(prev => {
                // Check if message already exists
                if (prev.some(msg => msg.id === newMessage.id)) {
                  console.log('Chat: Message already exists, skipping');
                  return prev;
                }
                
                // Add the message if it's not from current user (to avoid duplicate from local state)
                if (newMessage.sender_id !== currentEmployee.id) {
                  console.log('Chat: Adding new message from other user');
                  return [...prev, messageWithSender];
                }
                
                console.log('Chat: Message from current user already in local state');
                return prev;
              });
            };
            
            fetchSenderInfo();
          }

          // Always update chats list to reflect new message
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
        (payload) => {
          console.log('Chat: Received chat update via real-time:', payload);
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      console.log('Chat: Cleaning up real-time subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [currentEmployee, currentChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      console.log('Chat: Setting current chat:', chat);
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
