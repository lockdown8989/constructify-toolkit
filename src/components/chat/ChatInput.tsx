import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Image } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (message: string, attachmentData?: any) => void;
  onUploadFile?: (file: File) => Promise<any>;
  isAiMode?: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onUploadFile,
  isAiMode = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim() || disabled) return;

    const messageToSend = message;
    setMessage('');
    onSendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadFile) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const attachmentData = await onUploadFile(file);
      
      if (attachmentData) {
        const messageType = file.type.startsWith('image/') ? 'image' : 'text';
        const content = file.type.startsWith('image/') ? '' : `Shared file: ${file.name}`;
        
        onSendMessage(content, attachmentData);
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={
          isAiMode 
            ? "Ask the AI assistant..." 
            : "Type your message..."
        }
        disabled={disabled}
        className="flex-1"
      />
      
      {!isAiMode && onUploadFile && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="image/*,application/pdf,.doc,.docx,.txt"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="p-2 h-auto"
            title="Attach file"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>
        </>
      )}
      
      <Button
        onClick={handleSendMessage}
        disabled={!message.trim() || disabled}
        size="sm"
        className="p-2 h-auto"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};