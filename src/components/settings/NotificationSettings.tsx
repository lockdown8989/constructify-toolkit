
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Loader2 } from "lucide-react";

export const NotificationSettings = () => {
  const { settings, updateSettings, isLoading } = useNotificationSettings();
  const { t } = useLanguage();
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
    return (
      <div className="py-8 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading notification settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6 pt-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications" className="text-base font-medium cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch 
              id="email_notifications"
              checked={localSettings.email_notifications}
              onCheckedChange={() => handleChange('email_notifications')}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="space-y-0.5">
              <Label htmlFor="push_notifications" className="text-base font-medium cursor-pointer">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in-app
              </p>
            </div>
            <Switch 
              id="push_notifications"
              checked={localSettings.push_notifications}
              onCheckedChange={() => handleChange('push_notifications')}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
              <Label htmlFor="meeting_reminders" className="text-base font-medium cursor-pointer">
                Meeting Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders for upcoming meetings
              </p>
            </div>
            <Switch 
              id="meeting_reminders"
              checked={localSettings.meeting_reminders}
              onCheckedChange={() => handleChange('meeting_reminders')}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-6 flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving}
          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </form>
  );
};
