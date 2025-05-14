
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { RegionSettings } from "@/components/settings/RegionSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { AccountSection } from "@/components/settings/sections/AccountSection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { LocalizationSection } from "@/components/settings/sections/LocalizationSection";
import { SettingsBackButton } from "@/components/settings/sections/SettingsBackButton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user, isLoading, signOut, deleteAccount } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get section from location state or URL parameter
  const getInitialSection = () => {
    if (location.state?.section) {
      return location.state.section;
    }
    const params = new URLSearchParams(location.search);
    return params.get('section') || 'account';
  };
  
  const [activeSection, setActiveSection] = useState(getInitialSection());
  
  // Update the URL when the section changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('section', activeSection);
    navigate(`/settings?${searchParams.toString()}`, { replace: true });
  }, [activeSection, navigate, location.search]);
  
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // Call the deleteAccount method from useAuth
      const { success, error } = await deleteAccount!();
      
      if (success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully. You will be signed out now.",
        });
        
        // Navigate to auth page after successful deletion
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: error || "There was a problem deleting your account. Please try again later.",
          variant: "destructive",
        });
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting your account. Please try again later.",
        variant: "destructive",
      });
      setIsDeleting(false);
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

        {activeSection === 'account' && (
          <div className="space-y-4">
            <AccountSection />
            <AppearanceSection />
            <LocalizationSection />
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <SettingsBackButton onClick={() => setActiveSection('account')} />
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium">
                  {t('notifications')}
                </CardTitle>
                <CardDescription>
                  {t('manageNotifications')}
                </CardDescription>
              </CardHeader>
              <NotificationSettings />
            </Card>
          </div>
        )}

        {activeSection === 'region' && (
          <div className="space-y-4">
            <SettingsBackButton onClick={() => setActiveSection('account')} />
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium">
                  {t('regionCurrency')}
                </CardTitle>
                <CardDescription>
                  {t('configureLocation')}
                </CardDescription>
              </CardHeader>
              <RegionSettings />
            </Card>
          </div>
        )}

        {activeSection === 'language' && (
          <div className="space-y-4">
            <SettingsBackButton onClick={() => setActiveSection('account')} />
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium">
                  {t('language')}
                </CardTitle>
                <CardDescription>
                  {t('chooseLanguage')}
                </CardDescription>
              </CardHeader>
              <div className="p-6">
                <div className="w-full max-w-md">
                  <LanguageSelector 
                    language={user ? undefined : 'en'} 
                    onChange={() => {}} 
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'delete-account' && (
          <div className="space-y-4">
            <SettingsBackButton onClick={() => setActiveSection('account')} />
            <Card className="border rounded-xl shadow-sm border-destructive/20">
              <CardHeader className="bg-destructive/10">
                <CardTitle className="text-xl font-medium flex items-center">
                  <Trash2 className="mr-3 h-5 w-5 text-destructive" />
                  Delete My Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-6">
                  When you delete your account, all of your personal data, attendance records, and associated information will be permanently removed. This action cannot be undone.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : "Yes, Delete My Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
