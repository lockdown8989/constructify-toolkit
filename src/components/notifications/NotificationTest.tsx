
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { 
  createTestNotification, 
  verifyNotificationsTable 
} from '@/services/NotificationService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const NotificationTest: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleTestNotification = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to test notifications",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTestNotification(user.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Test notification sent successfully. Check the notification bell.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTable = async () => {
    setIsLoading(true);
    try {
      const result = await verifyNotificationsTable();
      setVerifyResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Notifications table verified successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying table:', error);
      toast({
        title: "Error",
        description: "Failed to verify notifications table",
        variant: "destructive",
      });
      setVerifyResult({ success: false, message: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Notification System Test</CardTitle>
        <CardDescription>
          Test the notification system to ensure it's working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Test Actions</h3>
          <div className="flex space-x-2">
            <Button 
              onClick={handleTestNotification} 
              disabled={isLoading || !user}
            >
              Send Test Notification
            </Button>
            <Button 
              onClick={handleVerifyTable} 
              variant="outline" 
              disabled={isLoading}
            >
              Verify DB Table
            </Button>
          </div>
        </div>
        
        {verifyResult && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Verification Result</h3>
            <div className={`p-3 rounded-md text-sm ${
              verifyResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <p className="font-medium">{verifyResult.success ? 'Success' : 'Error'}</p>
              <p>{verifyResult.message}</p>
              {verifyResult.data && (
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(verifyResult.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
        
        {!user && (
          <div className="p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm">
            You must be logged in to test notifications.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationTest;
