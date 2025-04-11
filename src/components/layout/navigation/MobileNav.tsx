
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet"
import { Menu, Home, User, Users, Calendar, FileText, Workflow, DollarSign, Receipt, Utensils, Clock } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/auth"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface MobileNavProps {
  isAuthenticated: boolean;
}

const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Function to navigate back
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
        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="grid gap-1 px-2 py-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <Home className="mr-3 h-5 w-5 text-neutral-600" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <FileText className="mr-3 h-5 w-5 text-neutral-600" />
              <span>About</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <User className="mr-3 h-5 w-5 text-neutral-600" />
              <span>Contact</span>
            </Link>
            {isAuthenticated && (
              <>
                <div className="h-[1px] bg-neutral-200 my-3 mx-6" />
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <User className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/people"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Users className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Employees</span>
                </Link>
                <Link
                  to="/employee-workflow"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Workflow className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Employee Workflow</span>
                </Link>
                <Link
                  to="/leave-management"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Calendar className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Leave & Schedule</span>
                </Link>
                <Link
                  to="/shift-calendar"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Utensils className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Shift Calendar</span>
                </Link>
                <Link
                  to="/salary"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <DollarSign className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Salary</span>
                </Link>
                <Link
                  to="/payroll"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Receipt className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Payslip</span>
                </Link>
              </>
            )}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
