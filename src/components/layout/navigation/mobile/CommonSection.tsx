
import { UserIcon, LogOut, Settings, FileText, Info, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import MobileNavLink from "./MobileNavLink";

interface CommonSectionProps {
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const CommonSection = ({ 
  isAuthenticated, 
  isEmployee, 
  hasManagerialAccess, 
  onClose 
}: CommonSectionProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/auth');
      onClose();
    } catch (error) {
      console.error("Mobile sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {isAuthenticated && (
        <>
          <MobileNavLink 
            to="/profile" 
            icon={<UserIcon />} 
            label="Profile" 
            onClick={onClose} 
          />
          <MobileNavLink 
            to="/profile-settings" 
            icon={<Settings />} 
            label="Settings" 
            onClick={onClose} 
          />
        </>
      )}
      
      <MobileNavLink 
        to="/about" 
        icon={<Info />} 
        label="About" 
        onClick={onClose} 
      />

      <MobileNavLink 
        to="/help" 
        icon={<HelpCircle />} 
        label="Help" 
        onClick={onClose} 
      />
      
      {isAuthenticated && (
        <div 
          onClick={handleSignOut}
          className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-red-600 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-600" />
          <span>Sign Out</span>
        </div>
      )}
    </>
  );
};

export default CommonSection;
