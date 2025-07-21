import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if user is not authenticated
  if (!user) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-background border border-border rounded-lg shadow-lg z-50 flex flex-col md:w-96 md:h-[600px] sm:w-80 sm:h-[500px] xs:w-72 xs:h-[450px]">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
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