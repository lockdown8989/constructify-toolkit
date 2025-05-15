
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PinCodeVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeName: string;
  action: 'in' | 'out';
}

const DEFAULT_PIN = '1234'; // Default PIN for all employees

const PinCodeVerification: React.FC<PinCodeVerificationProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeName,
  action
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handlePinComplete = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      // Simple PIN verification - in a real app, this would check against a database
      if (value === DEFAULT_PIN) {
        toast({
          title: "PIN Verified",
          description: "Authentication successful",
        });
        onSuccess();
        onClose();
      } else {
        setError('Invalid PIN code. Please try again.');
        setTimeout(() => setPin(''), 500); // Clear PIN after error
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handlePinComplete(pin);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyPress}>
        <DialogHeader>
          <DialogTitle className="text-center">
            Enter PIN to {action === 'in' ? 'Clock In' : 'Clock Out'}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Please enter PIN code to {action === 'in' ? 'clock in' : 'clock out'} for {employeeName}
          </p>
          
          <InputOTP 
            maxLength={4} 
            value={pin} 
            onChange={(value) => {
              setPin(value);
              setError('');
              if (value.length === 4) {
                handlePinComplete(value);
              }
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          
          <div className="text-xs text-center text-muted-foreground">
            Default PIN: 1234
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinCodeVerification;
