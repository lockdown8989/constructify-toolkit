
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet"
import { Menu, Home, User, Users, Calendar, Clock, FileText, Workflow, DollarSign, Receipt, Utensils, Settings } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/auth"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { useLanguage } from "@/hooks/use-language"

interface MobileNavProps {
  isAuthenticated: boolean;
}

const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const { isManager, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  // Determine if user is an employee (not a manager)
  const isEmployee = isAuthenticated && !isManager;
  
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
          <span className="sr-only">{t('toggleMenu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[85%] max-w-[300px] pb-safe-area-inset-bottom p-0 rounded-r-3xl bg-[#f8f8f8]/95 backdrop-blur-md border-0"
        showBackButton={location.pathname !== '/'}
        onBack={handleBack}
        backButtonLabel={t('back')}
      >
        <div className="flex items-center px-6 pt-8 pb-4">
          <div className="flex-1 text-center">
            <SheetTitle className="font-semibold text-lg">TeamPulse</SheetTitle>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="grid gap-1 px-2 py-2">
            <Link
              to="/"
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <Home className="mr-3 h-5 w-5 text-neutral-600" />
              <span>{t('home')}</span>
            </Link>
            
            <Link
              to="/about"
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <FileText className="mr-3 h-5 w-5 text-neutral-600" />
              <span>{t('about')}</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <User className="mr-3 h-5 w-5 text-neutral-600" />
              <span>{t('contact')}</span>
            </Link>
            {isAuthenticated && (
              <>
                <div className="h-[1px] bg-neutral-200 my-3 mx-6" />
                <Link
                  to="/profile"
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <User className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>{t('profile')}</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Settings className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>{t('settings')}</span>
                </Link>
                
                {/* Show these links only for managers */}
                {!isEmployee && (
                  <>
                    <Link
                      to="/people"
                      className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                    >
                      <Users className="mr-3 h-5 w-5 text-neutral-600" />
                      <span>{t('employees')}</span>
                    </Link>
                    <Link
                      to="/employee-workflow"
                      className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                    >
                      <Workflow className="mr-3 h-5 w-5 text-neutral-600" />
                      <span>{t('employeeWorkflow')}</span>
                    </Link>
                    <Link
                      to="/leave-management"
                      className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                    >
                      <Calendar className="mr-3 h-5 w-5 text-neutral-600" />
                      <span>{t('leaveManagement')}</span>
                    </Link>
                  </>
                )}
                
                {/* Always show shift calendar for all authenticated users */}
                <Link
                  to="/shift-calendar"
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Utensils className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>{t('shiftCalendar')}</span>
                </Link>
                
                {/* Always show salary for all authenticated users */}
                <Link
                  to="/salary"
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <DollarSign className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>{t('salary')}</span>
                </Link>
                
                {/* Show payslip only for managers */}
                {!isEmployee && (
                  <Link
                    to="/payroll"
                    className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                  >
                    <Receipt className="mr-3 h-5 w-5 text-neutral-600" />
                    <span>{t('payslip')}</span>
                  </Link>
                )}
                
                {/* Always show schedule requests for all authenticated users */}
                <Link
                  to="/schedule-requests"
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Clock className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>{t('scheduleRequests')}</span>
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
