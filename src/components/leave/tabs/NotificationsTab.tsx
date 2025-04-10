
import React, { useState, useEffect } from "react";
import WebhookConfig from "@/components/notifications/WebhookConfig";
import NotificationTest from "@/components/notifications/NotificationTest";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const NotificationsTab: React.FC = () => {
  const { isManager, isAdmin, isHR, user } = useAuth();
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const hasManagerAccess = isManager || isAdmin || isHR;

  // Check if notifications table is properly set up
  useEffect(() => {
    if (!user) return;
    
    const checkNotifications = async () => {
      try {
        console.log('NotificationsTab: Checking notifications for user', user.id);
        const { data, error, count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) {
          console.error('Error checking notifications:', error);
          return;
        }
        
        console.log('NotificationsTab: Notifications check result:', { count, data });
        setNotificationCount(count || 0);
      } catch (error) {
        console.error('Exception checking notifications:', error);
      }
    };
    
    checkNotifications();
  }, [user]);

  return (
    <Tabs defaultValue="test">
      <TabsList className="mb-4">
        <TabsTrigger value="test">Notification Test</TabsTrigger>
        {hasManagerAccess && (
          <TabsTrigger value="webhook">Webhook Config</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="test" className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg text-blue-700 mb-4">
          <p className="text-sm">
            This tab allows you to test the notification system. If notifications are working correctly, 
            you should see a notification appear in the notification bell after clicking "Send Test Notification".
          </p>
          <p className="text-sm mt-2">
            Current user has {notificationCount} notifications in the database.
          </p>
        </div>
        
        <NotificationTest />
      </TabsContent>
      
      {hasManagerAccess && (
        <TabsContent value="webhook">
          <WebhookConfig />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default NotificationsTab;
