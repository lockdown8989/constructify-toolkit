
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bell, Mail, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const NotificationSettings = () => {
  const { settings, updateSettings, isLoading } = useNotificationSettings();
  const isMobile = useIsMobile();
  const [localSettings, setLocalSettings] = useState({
    email_notifications: settings.email_notifications,
    push_notifications: settings.push_notifications,
    meeting_reminders: settings.meeting_reminders,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sync local settings when settings from hook change
  useEffect(() => {
    setLocalSettings({
      email_notifications: settings.email_notifications,
      push_notifications: settings.push_notifications,
      meeting_reminders: settings.meeting_reminders,
    });
  }, [settings]);

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
      <div className={`flex items-center justify-center ${isMobile ? 'py-8' : 'py-12'}`}>
        <div className="animate-pulse text-muted-foreground">Loading notification settings...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className={`space-y-4 ${isMobile ? 'px-4 pt-4' : 'pt-2'}`}>
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Bell className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div>
                <Label htmlFor="push_notifications" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Push Notifications
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
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
        
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Mail className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div>
                <Label htmlFor="email_notifications" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Email Notifications
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
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
        
        <Card className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-background/40 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <div className={`flex ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full bg-primary/10`}>
                <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              </div>
              <div>
                <Label htmlFor="meeting_reminders" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Meeting Reminders
                </Label>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
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
      
      <CardFooter className={`${isMobile ? 'px-4 pb-4' : 'pb-6'}`}>
        <Button 
          type="submit" 
          disabled={isSaving} 
          className={`w-full rounded-xl ${isMobile ? 'py-4' : 'py-6'}`}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </form>
  );
};
