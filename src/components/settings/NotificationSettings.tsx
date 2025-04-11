
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Bell, Mail, Calendar } from "lucide-react";

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
      <CardContent className="space-y-4 pt-2">
        <Card className="p-4 rounded-xl bg-background/40 border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="push_notifications" className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in-app
                </p>
              </div>
            </div>
            <Switch
              id="push_notifications"
              checked={localSettings.push_notifications}
              onCheckedChange={() => handleChange('push_notifications')}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-background/40 border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="email_notifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email_notifications"
              checked={localSettings.email_notifications}
              onCheckedChange={() => handleChange('email_notifications')}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-background/40 border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="meeting_reminders" className="text-base font-medium">
                  Meeting Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders for upcoming meetings
                </p>
              </div>
            </div>
            <Switch
              id="meeting_reminders"
              checked={localSettings.meeting_reminders}
              onCheckedChange={() => handleChange('meeting_reminders')}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>
      </CardContent>
      
      <CardFooter className="pb-6">
        <Button 
          type="submit" 
          disabled={isSaving} 
          className="w-full rounded-xl py-6"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </form>
  );
};
