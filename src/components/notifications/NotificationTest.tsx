
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createTestNotification, verifyNotificationsTable } from "@/services/notifications";

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
              variant="outline" 
              onClick={handleVerifyTable}
              disabled={isLoading}
            >
              Verify Table Setup
            </Button>
          </div>
        </div>
        
        {verifyResult && (
          <div className="mt-4 p-4 rounded border bg-muted/20">
            <h4 className="font-medium mb-2">Verification Result</h4>
            <p className={verifyResult.success ? "text-green-600" : "text-red-600"}>
              {verifyResult.message}
            </p>
            {verifyResult.data && (
              <pre className="mt-2 text-xs overflow-auto p-2 bg-muted rounded">
                {JSON.stringify(verifyResult.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <p className="text-xs text-muted-foreground">
          {user 
            ? `Testing notifications for user: ${user.id}` 
            : "You need to be logged in to test notifications"}
        </p>
      </CardFooter>
    </Card>
  );
};

export default NotificationTest;
