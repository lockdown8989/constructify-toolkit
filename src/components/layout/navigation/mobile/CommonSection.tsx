
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { File, Settings, LogIn, LogOut } from "lucide-react";
import MobileNavLink from "./MobileNavLink";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      setIsSigningOut(true);
      console.log("Sign out initiated from MobileNav");
      
      if (signOut) {
        await signOut();
        onClose(); // Close mobile menu after sign out
      } else {
        toast({
          title: "Error",
          description: "Sign out function is not available",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in mobile sign out:", error);
      // Final fallback - force navigation to auth page
      toast({
        title: "Redirecting",
        description: "Navigating to sign in page",
      });
      navigate('/auth');
      onClose();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          {(isEmployee || hasManagerialAccess) && (
            <MobileNavLink 
              to="/documents"
              icon={File}
              label="Documents"
              onClick={() => {
                navigate('/documents');
                onClose();
              }}
            />
          )}
          
          <MobileNavLink 
            to="/settings"
            icon={Settings}
            label="Settings"
            onClick={() => {
              navigate('/settings');
              onClose();
            }}
          />
          
          <MobileNavLink 
            to="/auth"
            icon={LogOut}
            label={isSigningOut ? "Signing out..." : "Sign out"}
            onClick={handleSignOut}
          />
        </>
      ) : (
        <MobileNavLink 
          to="/auth"
          icon={LogIn}
          label="Sign in"
          onClick={() => {
            navigate('/auth');
            onClose();
          }}
        />
      )}
    </>
  );
};

export default CommonSection;
