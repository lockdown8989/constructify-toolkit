
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowLeft, User, Bell, Palette, Clock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { PersonalInfoForm } from "@/components/profile-settings/PersonalInfoForm";
import RegionalPreferencesForm from "@/components/profile-settings/RegionalPreferencesForm";
import { DeleteAccountSection } from "@/components/profile-settings/DeleteAccountSection";
import WeeklyAvailabilitySection from "@/components/profile/WeeklyAvailabilitySection";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import { AppearanceProvider } from "@/hooks/use-appearance-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ProfileSettings = () => {
  const { user, isLoading, isAdmin, subscribed } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get section from location state or URL parameter
  const getInitialSection = () => {
    if (location.state?.section) {
      return location.state.section;
    }
    const params = new URLSearchParams(location.search);
    return params.get('section') || 'personal-info';
  };
  
  const [activeSection, setActiveSection] = useState(getInitialSection());
  
  const handleManageSubscription = async () => {
    if (!isAdmin) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');
      if (subscribed === false) { navigate('/billing'); return; }
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (e: any) {
      console.error('Customer portal error', e);
      toast({ description: e.message || 'Failed to open customer portal' });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'personal-info':
        return (
          <Card className="border rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl font-medium flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                {t('personalInfo')}
              </CardTitle>
              <CardDescription>{t('updatePersonalInfo')}</CardDescription>
            </CardHeader>
            <PersonalInfoForm user={user} />
            <DeleteAccountSection />
          </Card>
        );
      case 'availability':
        return <WeeklyAvailabilitySection />;
      case 'notifications':
        return (
          <Card className="border rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl font-medium flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                {t('notifications')}
              </CardTitle>
              <CardDescription>{t('manageNotifications')}</CardDescription>
            </CardHeader>
            <NotificationProvider>
              <NotificationSettings />
            </NotificationProvider>
          </Card>
        );
      case 'appearance':
        return (
          <Card className="border rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl font-medium flex items-center">
                <Palette className="mr-2 h-5 w-5 text-primary" />
                {t('appearance')}
              </CardTitle>
              <CardDescription>{t('customizeAppearance')}</CardDescription>
            </CardHeader>
            <AppearanceProvider>
              <AppearanceSettings />
            </AppearanceProvider>
          </Card>
        );
      case 'regional':
        return (
          <Card className="border rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl font-medium flex items-center">
                <Palette className="mr-2 h-5 w-5 text-primary" />
                {t('regionCurrency')}
              </CardTitle>
              <CardDescription>{t('configureLocation')}</CardDescription>
            </CardHeader>
            <RegionalPreferencesForm user={user} />
          </Card>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="relative container mx-auto py-12 px-4 md:py-20 md:pt-24 max-w-3xl">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 md:hidden" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>
      
      <div className="max-w-2xl mx-auto pt-10 md:pt-0">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-semibold mb-2">{t('profile_settings')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('manageSettings')}
          </p>
          <Separator className="mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <nav className="space-y-2">
              <Button
                variant={activeSection === 'personal-info' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('personal-info')}
              >
                <User className="mr-2 h-4 w-4" />
                {t('personalInfo')}
              </Button>
              <Button
                variant={activeSection === 'availability' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('availability')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Weekly Availability
              </Button>
              <Button
                variant={activeSection === 'notifications' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('notifications')}
              >
                <Bell className="mr-2 h-4 w-4" />
                {t('notifications')}
              </Button>
              <Button
                variant={activeSection === 'appearance' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('appearance')}
              >
                <Palette className="mr-2 h-4 w-4" />
                {t('appearance')}
              </Button>
              <Button
                variant={activeSection === 'regional' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('regional')}
              >
                <Palette className="mr-2 h-4 w-4" />
                {t('regionCurrency')}
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleManageSubscription}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Manage Subscription Plan
                </Button>
              )}

            </nav>
          </div>
          
          <div className="md:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
