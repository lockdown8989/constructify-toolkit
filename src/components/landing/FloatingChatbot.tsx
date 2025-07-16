
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would integrate with your chatbot service
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat window */}
      {isOpen && (
        <Card className="mb-4 w-80 h-96 bg-white/10 backdrop-blur-lg border border-white/20 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-white text-lg">Chat Assistant</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 mb-4 p-4 bg-white/5 rounded-lg">
              <div className="text-gray-300 text-sm">
                Hi! I'm here to help you learn about our employee scheduling platform. 
                Ask me anything about features, pricing, or getting started!
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating button */}
      <Button
        onClick={toggleChat}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-110 hover:shadow-purple-500/40"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </Button>
    </div>
  );
};
