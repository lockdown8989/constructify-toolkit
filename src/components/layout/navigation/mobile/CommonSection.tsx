
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
              icon={<File size={20} className="text-neutral-600" />}
              label="Documents"
              onClick={() => {
                navigate('/documents');
                onClose();
              }}
            />
          )}
          
          <MobileNavLink 
            icon={<Settings size={20} className="text-neutral-600" />}
            label="Settings"
            onClick={() => {
              navigate('/settings');
              onClose();
            }}
          />
          
          <MobileNavLink 
            icon={<LogOut size={20} className="text-red-500" />}
            label={isSigningOut ? "Signing out..." : "Sign out"}
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-red-500"
          />
        </>
      ) : (
        <MobileNavLink 
          icon={<LogIn size={20} className="text-neutral-600" />}
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
