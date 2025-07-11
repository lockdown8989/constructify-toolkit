
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PinCodeVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeName: string;
  action: 'in' | 'out';
  employeeId: string;
}

const DEFAULT_PIN = '1234'; // Default PIN for all employees

const PinCodeVerification: React.FC<PinCodeVerificationProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeName,
  action,
  employeeId
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [pinDots, setPinDots] = useState('');
  const [employeePinCode, setEmployeePinCode] = useState('');
  const { toast } = useToast();

  // Fetch employee PIN code when dialog opens
  useEffect(() => {
    if (isOpen && employeeId) {
      setPin('');
      setError('');
      setPinDots('');
      
      const fetchEmployeePinCode = async () => {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('pin_code')
            .eq('id', employeeId)
            .single();
          
          if (error) throw error;
          setEmployeePinCode(data.pin_code || '1234');
        } catch (error) {
          console.error('Error fetching employee PIN code:', error);
          setEmployeePinCode('1234'); // Fallback to default
        }
      };
      
      fetchEmployeePinCode();
    }
  }, [isOpen, employeeId]);

  const handlePinComplete = (value: string) => {
    if (value === employeePinCode) {
      toast({
        title: "PIN Verified",
        description: "Authentication successful",
      });
      setPin('');
      setPinDots('');
      onSuccess();
    } else {
      setError('Invalid PIN code. Please try again.');
      setPin('');
      setPinDots('');
    }
  };

  const addDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinDots(pinDots + '•');
      
      if (newPin.length === 4) {
        handlePinComplete(newPin);
      }
    }
  };

  const removeDigit = () => {
    setPin(pin.slice(0, -1));
    setPinDots(pinDots.slice(0, -1));
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black text-white border-gray-800 p-8 max-w-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 text-white hover:bg-gray-800"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center space-y-8 py-6">
          <h2 className="text-xl font-medium text-center">
            Enter PIN to {action === 'in' ? 'Clock In' : 'Clock Out'}
          </h2>
          
          <div className="w-full text-center">
            <p className="text-sm text-gray-400 mb-4">
              Please enter PIN code for {employeeName}
            </p>
            
            <div className="text-5xl font-mono font-bold mb-6 min-h-16 flex justify-center items-center">
              {pinDots || <span className="text-gray-600">•</span>}
            </div>
            
            {error && (
              <p className="text-sm font-medium text-red-400 mb-4">{error}</p>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                onClick={() => addDigit(num.toString())}
                variant="ghost"
                className="w-16 h-16 rounded-full text-2xl font-medium bg-gray-900 hover:bg-gray-800"
              >
                {num}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-16 h-16 rounded-full text-2xl font-medium bg-gray-900 hover:bg-gray-800"
              onClick={() => addDigit('0')}
            >
              0
            </Button>
            <Button
              variant="ghost"
              className="w-16 h-16 rounded-full text-2xl font-medium bg-gray-900 hover:bg-gray-800 col-start-3"
              onClick={removeDigit}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="text-xs text-center text-gray-400 mt-4">
            <strong>Employee PIN: {employeePinCode || 'Loading...'}</strong>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinCodeVerification;
