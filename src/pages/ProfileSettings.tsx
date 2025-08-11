
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
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  
  const handleManageSubscription = async () => {
    if (!isAdmin || isManagingSubscription) return;
    
    setIsManagingSubscription(true);
    try {
      console.log('🔄 Starting subscription management...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // If not subscribed, redirect to billing page
      if (subscribed === false) {
        console.log('🔗 Not subscribed, redirecting to billing');
        navigate('/billing');
        return;
      }

      console.log('🔄 Calling customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        console.error('❌ Customer portal error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('🚀 Redirecting to customer portal:', data.url);
        toast({ description: 'Opening subscription management portal...' });
        // Use window.location.href for same-tab redirect
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (e: any) {
      console.error('💥 Customer portal error:', e);
      let errorMessage = 'Failed to open subscription management';
      
      if (e.message?.includes('No active session')) {
        errorMessage = 'Session expired. Please refresh the page and try again.';
      } else if (e.message?.includes('No portal URL')) {
        errorMessage = 'Unable to create portal session. Please try again.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      toast({ 
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setIsManagingSubscription(false);
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
    <div className="min-h-screen bg-muted/20">
      {/* Mobile Back Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-4 left-4 z-10 md:hidden" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>
      
      <div className="container mx-auto py-8 px-4 md:py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 pt-12 md:pt-0">
          <div className="text-center md:text-left max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {t('profile_settings')}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('manageSettings')}
            </p>
          </div>
          <Separator className="mt-8" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border rounded-xl shadow-sm sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Settings</CardTitle>
              </CardHeader>
              <div className="px-6 pb-6">
                <nav className="space-y-2">
                  <Button
                    variant={activeSection === 'personal-info' ? 'default' : 'ghost'}
                    className="w-full justify-start h-12 text-sm font-medium"
                    onClick={() => setActiveSection('personal-info')}
                  >
                    <User className="mr-3 h-4 w-4" />
                    {t('personalInfo')}
                  </Button>
                  
                  <Button
                    variant={activeSection === 'availability' ? 'default' : 'ghost'}
                    className="w-full justify-start h-12 text-sm font-medium"
                    onClick={() => setActiveSection('availability')}
                  >
                    <Clock className="mr-3 h-4 w-4" />
                    Weekly Availability
                  </Button>
                  
                  <Button
                    variant={activeSection === 'notifications' ? 'default' : 'ghost'}
                    className="w-full justify-start h-12 text-sm font-medium"
                    onClick={() => setActiveSection('notifications')}
                  >
                    <Bell className="mr-3 h-4 w-4" />
                    {t('notifications')}
                  </Button>
                  
                  <Button
                    variant={activeSection === 'appearance' ? 'default' : 'ghost'}
                    className="w-full justify-start h-12 text-sm font-medium"
                    onClick={() => setActiveSection('appearance')}
                  >
                    <Palette className="mr-3 h-4 w-4" />
                    {t('appearance')}
                  </Button>
                  
                  <Button
                    variant={activeSection === 'regional' ? 'default' : 'ghost'}
                    className="w-full justify-start h-12 text-sm font-medium"
                    onClick={() => setActiveSection('regional')}
                  >
                    <Palette className="mr-3 h-4 w-4" />
                    {t('regionCurrency')}
                  </Button>

                  {isAdmin && (
                    <>
                      <Separator className="my-4" />
                      <div className="px-2 py-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Admin
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={handleManageSubscription}
                        disabled={isManagingSubscription}
                      >
                        {isManagingSubscription ? (
                          <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                        ) : (
                          <Crown className="mr-3 h-4 w-4" />
                        )}
                        {isManagingSubscription ? 'Opening Portal...' : 'Manage Subscription'}
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </Card>
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
