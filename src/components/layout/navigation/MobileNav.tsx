
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet"
import { Menu } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/auth"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { TimeClock } from "./mobile/TimeClock"
import { NavLinks } from "./mobile/NavLinks"

interface MobileNavProps {
  isAuthenticated: boolean;
}

const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const { isAdmin, isHR, isManager } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const isEmployee = isAuthenticated && !hasManagerialAccess;
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isClockingEnabled = !hasManagerialAccess && isAuthenticated;
  
  const handleBack = () => {
    if (location.pathname !== '/') {
      navigate(-1);
    }
    setIsOpen(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden touch-target">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-[85%] max-w-[300px] pb-safe-area-inset-bottom p-0 rounded-r-3xl bg-[#f8f8f8]/95 backdrop-blur-md border-0"
        showBackButton={location.pathname !== '/'}
        onBack={handleBack}
        backButtonLabel="Back"
      >
        <div className="flex items-center px-6 pt-8 pb-4">
          <div className="flex-1 text-center">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <SheetTitle className="font-semibold text-lg">TeamPulse</SheetTitle>
            </Link>
          </div>
        </div>
        
        {isClockingEnabled && (
          <TimeClock onAction={() => setIsOpen(false)} />
        )}
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          <NavLinks 
            isAuthenticated={isAuthenticated}
            hasManagerialAccess={hasManagerialAccess}
            isEmployee={isEmployee}
            onLinkClick={() => setIsOpen(false)}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
