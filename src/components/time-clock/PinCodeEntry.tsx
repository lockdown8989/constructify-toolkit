
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PinCodeEntryProps {
  onComplete: (pin: string) => void;
  onCancel: () => void;
  title?: string;
  action?: 'in' | 'out' | 'break';
  userName?: string;
}

const PinCodeEntry: React.FC<PinCodeEntryProps> = ({ 
  onComplete, 
  onCancel, 
  title = "Enter PIN",
  action,
  userName,
}) => {
  const [pin, setPin] = useState<string>('');
  const { toast } = useToast();
  
  // Focus handling for keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9' && pin.length < 4) {
        setPin(prev => prev + e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter' && pin.length === 4) {
        handleSubmit();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const handleKeyPress = (key: string | number) => {
    if (pin.length < 4) {
      setPin(prev => prev + key);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      onComplete(pin);
    } else {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      });
    }
  };

  // Get header color based on action type
  const getHeaderColor = () => {
    if (action === 'in') return "bg-green-600";
    if (action === 'out') return "bg-red-600";
    if (action === 'break') return "bg-blue-600";
    return "bg-blue-600";
  };

  // Get button color based on action type
  const getButtonColor = () => {
    if (action === 'in') return "bg-green-500 hover:bg-green-600";
    if (action === 'out') return "bg-red-500 hover:bg-red-600";
    if (action === 'break') return "bg-blue-500 hover:bg-blue-600";
    return "bg-blue-500 hover:bg-blue-600";
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black text-white rounded-lg overflow-hidden shadow-2xl">
      <div className={`${getHeaderColor()} p-6 text-center`}>
        <div className="text-3xl font-bold">
          {userName ? `${title}: ${userName}` : title}
        </div>
        {action && (
          <div className="mt-2 flex justify-center">
            {action === 'in' && <Check className="h-12 w-12 text-white" />}
            {action === 'out' && <X className="h-12 w-12 text-white" />}
            {action === 'break' && <span className="text-2xl">☕</span>}
          </div>
        )}
      </div>

      <div className="p-6 text-center bg-gray-900">
        <div className="text-4xl font-mono mb-8 tracking-widest">
          {pin.split('').map((_, i) => (
            <span key={i} className="mx-1">•</span>
          ))}
          {Array(4 - pin.length).fill('_').map((_, i) => (
            <span key={i + pin.length} className="mx-1 text-gray-500">_</span>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Button
              key={num}
              onClick={() => handleKeyPress(num)}
              variant="outline"
              className="h-16 w-16 text-2xl rounded-full bg-gray-800 hover:bg-gray-700 border-none text-white"
            >
              {num}
            </Button>
          ))}
          <Button
            onClick={onCancel}
            variant="outline"
            className="h-16 w-16 text-xl rounded-full bg-gray-700 hover:bg-gray-600 border-none text-white"
          >
            <X />
          </Button>
          <Button
            onClick={() => handleKeyPress(0)}
            variant="outline"
            className="h-16 w-16 text-2xl rounded-full bg-gray-800 hover:bg-gray-700 border-none text-white"
          >
            0
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="h-16 w-16 text-xl rounded-full bg-gray-700 hover:bg-gray-600 border-none text-white"
          >
            ←
          </Button>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            onClick={onCancel}
            variant="outline" 
            className="bg-gray-700 hover:bg-gray-600 border-none text-white h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={`h-12 text-lg ${getButtonColor()}`}
            disabled={pin.length !== 4}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PinCodeEntry;
