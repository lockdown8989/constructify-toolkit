
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SessionTimeoutWarning: React.FC = () => {
  const { session } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!session?.expires_at) return;

    const checkSessionExpiry = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at!;
      const timeUntilExpiry = expiresAt - now;
      
      // Show warning 5 minutes before expiry
      const warningThreshold = 5 * 60; // 5 minutes in seconds
      
      if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeLeft(timeUntilExpiry);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSessionExpiry();
    
    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000);
    
    return () => clearInterval(interval);
  }, [session]);

  const handleRefreshSession = async () => {
    try {
      console.log('🔄 Refreshing session...');
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh error:', error);
      } else {
        console.log('✅ Session refreshed successfully');
        setShowWarning(false);
      }
    } catch (error) {
      console.error('💥 Session refresh exception:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Clock className="h-4 w-4" />
            Session Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-yellow-700 mb-3">
            Your session will expire in {formatTime(timeLeft)}. Refresh to continue working.
          </p>
          <Button 
            onClick={handleRefreshSession}
            size="sm"
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
