
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet"
import { Menu } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { useAuth } from '@/hooks/use-auth'
import MobileNavContent from './mobile/MobileNavContent'

interface MobileNavProps {
  isAuthenticated: boolean;
}

const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, isHR, isManager, isEmployee, isPayroll } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  
  const handleBack = () => {
    if (location.pathname !== '/') {
      navigate(-1);
    }
    setIsOpen(false);
  };
  
  const handleHomeClick = () => {
    navigate('/dashboard');
    setIsOpen(false);
  };
  
  const handleClose = () => setIsOpen(false);
  
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
        <MobileNavContent 
          isOpen={isOpen}
          onClose={handleClose}
          isAuthenticated={isAuthenticated}
          isEmployee={isEmployee}
          hasManagerialAccess={hasManagerialAccess}
          isPayroll={isPayroll}
        />
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
