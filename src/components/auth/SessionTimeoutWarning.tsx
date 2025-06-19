
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Session timeout warning component for enhanced security
 */
const SessionTimeoutWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  // Session timeout configuration (24 hours)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Use expires_at if available, otherwise calculate from current time
        const sessionExpiry = session.expires_at ? session.expires_at * 1000 : Date.now() + SESSION_TIMEOUT;
        const now = Date.now();
        const timeUntilTimeout = sessionExpiry - now;
        
        if (timeUntilTimeout <= WARNING_TIME && timeUntilTimeout > 0) {
          setShowWarning(true);
          setTimeLeft(Math.floor(timeUntilTimeout / 1000));
          
          // Start countdown
          countdownTimer = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                handleSessionTimeout();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (timeUntilTimeout <= 0) {
          handleSessionTimeout();
        } else {
          // Set timer to show warning
          warningTimer = setTimeout(() => {
            setShowWarning(true);
            setTimeLeft(WARNING_TIME / 1000);
          }, timeUntilTimeout - WARNING_TIME);
        }
      }
    };

    checkSession();

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [SESSION_TIMEOUT, WARNING_TIME]);

  const handleSessionTimeout = async () => {
    setShowWarning(false);
    
    toast({
      title: "Session Expired",
      description: "Your session has expired for security reasons. Please sign in again.",
      variant: "destructive",
    });
    
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const handleExtendSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        handleSessionTimeout();
      } else {
        setShowWarning(false);
        toast({
          title: "Session Extended",
          description: "Your session has been extended successfully.",
        });
      }
    } catch (error) {
      console.error('Session extension error:', error);
      handleSessionTimeout();
    }
  };

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Alert className="border-amber-500 bg-amber-50">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="space-y-2">
            <p className="font-semibold">Session Timeout Warning</p>
            <p>
              Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')} for security reasons.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleExtendSession}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Extend Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSessionTimeout}
              >
                Sign Out Now
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SessionTimeoutWarning;
