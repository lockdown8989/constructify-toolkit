
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
import { useAuth } from "@/hooks/auth"
import { Settings, User as UserIcon, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLanguage, TranslationKey } from "@/hooks/language"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isManager, isHR } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Format display name from email or profile
  const getDisplayName = (): string => {
    if (!user) return '';
    
    // Get name from metadata if available
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    
    // Fall back to email
    return user.email?.split('@')[0] || 'User';
  };
  
  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      setIsSigningOut(true);
      console.log("UserMenu: Attempting to sign out");
      
      // Check if we have an active session first
      try {
        await signOut();
        console.log("UserMenu: Sign out successful, navigating to /auth");
      } catch (error) {
        console.error("UserMenu: Sign out error:", error);
        // Even on error, navigate to auth page
        navigate('/auth');
      }
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
          <div className="font-medium text-foreground truncate">{user.email}</div>
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
          <span>{isSigningOut ? "Signing out..." : t('sign_out')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
