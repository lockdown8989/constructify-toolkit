
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PinCodeEntryProps {
  onComplete: (pin: string) => void;
  onCancel: () => void;
  title?: string;
  action?: 'in' | 'out';
}

const PinCodeEntry: React.FC<PinCodeEntryProps> = ({ 
  onComplete, 
  onCancel, 
  title = "Enter PIN",
  action
}) => {
  const [pin, setPin] = useState<string>('');
  const { toast } = useToast();

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

  return (
    <div className="w-full max-w-md mx-auto bg-black text-white rounded-lg overflow-hidden">
      <div className={action === 'in' ? "bg-green-600 p-6 text-center" : action === 'out' ? "bg-red-600 p-6 text-center" : "bg-blue-600 p-6 text-center"}>
        <div className="text-3xl font-bold">{title}</div>
      </div>

      <div className="p-6 text-center">
        <div className="text-4xl font-mono mb-8 tracking-widest">
          {pin ? 
            Array(pin.length).fill("•").join(" ") :
            <span className="text-gray-500">----</span>
          }
        </div>
        
        <div className="grid grid-cols-3 gap-4">
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
        
        <Button
          onClick={handleSubmit}
          className={`mt-6 w-full h-12 text-lg ${
            action === 'in' 
              ? "bg-green-500 hover:bg-green-600" 
              : action === 'out' 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default PinCodeEntry;
