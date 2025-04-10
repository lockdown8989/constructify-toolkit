
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const NotificationSettings = () => {
  const { settings, updateSettings, isLoading } = useNotificationSettings();
  const [localSettings, setLocalSettings] = useState({
    email_notifications: settings.email_notifications,
    push_notifications: settings.push_notifications,
    meeting_reminders: settings.meeting_reminders,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (setting: keyof typeof localSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings(localSettings);
    setIsSaving(false);
  };

  if (isLoading) {
    return <div>Loading notification settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="email_notifications" className="flex-1">
              <div>Email Notifications</div>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </Label>
            <Switch 
              id="email_notifications"
              checked={localSettings.email_notifications}
              onCheckedChange={() => handleChange('email_notifications')}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Label htmlFor="push_notifications" className="flex-1">
              <div>Push Notifications</div>
              <p className="text-sm text-muted-foreground">
                Receive notifications in-app
              </p>
            </Label>
            <Switch 
              id="push_notifications"
              checked={localSettings.push_notifications}
              onCheckedChange={() => handleChange('push_notifications')}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Label htmlFor="meeting_reminders" className="flex-1">
              <div>Meeting Reminders</div>
              <p className="text-sm text-muted-foreground">
                Receive reminders for upcoming meetings
              </p>
            </Label>
            <Switch 
              id="meeting_reminders"
              checked={localSettings.meeting_reminders}
              onCheckedChange={() => handleChange('meeting_reminders')}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </form>
  );
};
