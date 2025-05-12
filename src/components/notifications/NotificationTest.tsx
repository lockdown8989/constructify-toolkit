
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { sendTestNotification, verifyNotificationsTable } from '@/services/notifications/notification-testing';

const NotificationTest = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<{
    verified: boolean;
    message: string;
  }>({ verified: false, message: 'Not verified yet' });

  const handleTest = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // First verify the notifications table exists
      const verifyResult = await verifyNotificationsTable();
      setDatabaseStatus({
        verified: verifyResult.success,
        message: verifyResult.message
      });
      
      if (!verifyResult.success) {
        toast({
          title: 'Database verification failed',
          description: verifyResult.message,
          variant: 'destructive',
        });
        setIsTesting(false);
        return;
      }
      
      // Send a test notification
      const testResult = await sendTestNotification(user.id);
      
      if (testResult.success) {
        toast({
          title: 'Test notification sent',
          description: 'Check the notification bell to see the test notification',
        });
      } else {
        toast({
          title: 'Test failed',
          description: testResult.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in notification test:', error);
      toast({
        title: 'Test error',
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Test</CardTitle>
        <CardDescription>
          Test if notifications are working correctly for this user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Database status: <span className={databaseStatus.verified ? "text-green-500" : "text-amber-500"}>{databaseStatus.message}</span>
          </p>
          
          <p className="text-sm text-muted-foreground">
            {user 
              ? `Sending test notification to user: ${user.email || user.id}`
              : 'You need to be logged in to test notifications'}
          </p>
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={isTesting || !user}
          className="w-full"
        >
          {isTesting ? 'Sending...' : 'Send Test Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationTest;
