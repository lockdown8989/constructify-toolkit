
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useSecureSession } from '@/hooks/auth/useSecureSession';

export const SessionTimeoutWarning: React.FC = () => {
  const { timeUntilExpiry, isNearExpiry, extendSession } = useSecureSession();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isNearExpiry && timeUntilExpiry > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [isNearExpiry, timeUntilExpiry]);

  const handleExtendSession = () => {
    extendSession();
    setShowWarning(false);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire in {formatTime(timeUntilExpiry)} due to inactivity. 
            Would you like to extend your session?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowWarning(false)}
          >
            Sign Out
          </Button>
          <Button onClick={handleExtendSession}>
            Stay Signed In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
