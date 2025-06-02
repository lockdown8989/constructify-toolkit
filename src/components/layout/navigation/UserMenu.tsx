
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { Settings, User as UserIcon, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/hooks/use-language"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isManager, isHR, isPayroll } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, position')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.log('Profile not found, using email fallback');
          } else {
            setProfile(data);
          }
        } catch (err) {
          console.log('Error fetching profile:', err);
        }
      }
    };

    fetchProfile();
  }, [user]);
  
  // Format display name from profile or email
  const getDisplayName = (): string => {
    if (!user) return '';
    
    // Use profile data if available
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    
    // Get name from user metadata if available
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    
    // Fall back to email
    return user.email?.split('@')[0] || 'User';
  };
  
  // Get user role for display
  const getUserRoleDisplay = (): string => {
    if (isAdmin) return '(admin)';
    if (isHR) return '(HR)';
    if (isManager) return '(manager)';
    if (isPayroll) return '(payroll)';
    return '(employee)';
  };

  // Get user position from profile
  const getUserPosition = (): string => {
    if (profile?.position) return profile.position;
    return getUserRoleDisplay().replace(/[()]/g, ''); // Remove parentheses from role
  };
  
  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      setIsSigningOut(true);
      console.log("Sign out initiated from UserMenu");
      
      if (signOut) {
        // Let the signOut function handle all toasts and navigation
        await signOut();
      } else {
        console.error("signOut function is not available");
        // Fallback - navigate to auth page
        toast({
          title: "Sign out issue",
          description: "There was an issue signing out. Please try again.",
          variant: "destructive"
        });
        navigate('/auth?signout=true');
      }
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      // Final fallback - force navigation to auth page
      navigate('/auth?signout=true');
    } finally {
      setIsSigningOut(false);
    }
  };
  
  const navigateToProfile = () => {
    navigate('/profile');
  };
  
  const navigateToProfileSettings = () => {
    navigate('/profile-settings');
  };
  
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-normal text-muted-foreground text-xs">{t('signed_in_as')}</div>
          <div className="font-medium text-foreground">
            {getDisplayName()}
          </div>
          <div className="text-sm text-muted-foreground">
            {getUserPosition()}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={navigateToProfile}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{t('profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={navigateToProfileSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('profile_settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="text-red-500"
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? t('sign_out') + "..." : t('sign_out')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
