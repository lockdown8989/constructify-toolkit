import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet"
import { Menu, Home, User, Users, Calendar, FileText, Workflow, DollarSign, Receipt, Utensils, Clock, ClipboardCheck, Coffee } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/auth"
import { useState } from "react"
import { useTimeClock } from "@/hooks/time-clock"
import { Badge } from "@/components/ui/badge"

interface MobileNavProps {
  isAuthenticated: boolean;
}

const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const { isAdmin, isHR, isManager } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const isEmployee = isAuthenticated && !hasManagerialAccess; // Added explicit isEmployee flag
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  const isClockingEnabled = !hasManagerialAccess && isAuthenticated;
  
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
          <div className="px-4 mb-4">
            {status === 'clocked-out' ? (
              <Button 
                onClick={() => {
                  handleClockIn();
                  setIsOpen(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            ) : status === 'clocked-in' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => {
                    handleBreakStart();
                    setIsOpen(false);
                  }}
                  variant="outline"
                  className="border-blue-300"
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Break
                </Button>
                <Button 
                  onClick={() => {
                    handleClockOut();
                    setIsOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => {
                  handleBreakEnd();
                  setIsOpen(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                End Break
              </Button>
            )}
            
            <div className="text-center mt-2 text-sm">
              <Badge variant={status === 'clocked-in' ? 'default' : status === 'on-break' ? 'outline' : 'secondary'} 
                className={status === 'clocked-in' ? 'bg-green-100 text-green-800 border border-green-300' : 
                         status === 'on-break' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                         'bg-gray-100 text-gray-800 border border-gray-300'}>
                {status === 'clocked-in' ? 'Currently Clocked In' : 
                 status === 'on-break' ? 'On Break' : 
                 'Clocked Out'}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="h-[1px] bg-neutral-200 my-2 mx-6"></div>
        
        {/* Manager Time Clock Access */}
        {hasManagerialAccess && (
          <div className="px-4 mb-4">
            <Button 
              onClick={() => {
                navigate('/manager-time-clock');
                setIsOpen(false);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Manager Time Clock
            </Button>
          </div>
        )}
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="grid gap-1 px-2 py-2">
            <div
              onClick={handleHomeClick}
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <Home className="mr-3 h-5 w-5 text-neutral-600" />
              <span>Home</span>
            </div>
            
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
                {hasManagerialAccess && (
                  <Link
                    to="/attendance"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                  >
                    <ClipboardCheck className="mr-3 h-5 w-5 text-neutral-600" />
                    <span>Attendance</span>
                  </Link>
                )}
                {hasManagerialAccess ? (
                  <Link
                    to="/employee-workflow"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                  >
                    <Clock className="mr-3 h-5 w-5 text-neutral-600" />
                    <span>My Employee Shifts</span>
                  </Link>
                ) : (
                  <Link
                    to="/employee-workflow"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                  >
                    <Clock className="mr-3 h-5 w-5 text-neutral-600" />
                    <span>My Schedule</span>
                  </Link>
                )}
                
                {hasManagerialAccess && (
                  <>
                    <Link
                      to="/people"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                    >
                      <Users className="mr-3 h-5 w-5 text-neutral-600" />
                      <span>Team Members</span>
                    </Link>
                    <Link
                      to="/shift-calendar"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                    >
                      <Calendar className="mr-3 h-5 w-5 text-neutral-600" />
                      <span>Restaurant Schedule</span>
                    </Link>
                  </>
                )}
                
                <Link
                  to="/leave-management"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                >
                  <Calendar className="mr-3 h-5 w-5 text-neutral-600" />
                  <span>Leave & Schedule</span>
                </Link>
                
                {isEmployee && (
                  <Link
                    to="/salary"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
                  >
                    <DollarSign className="mr-3 h-5 w-5 text-neutral-600" />
                    <span>Salary</span>
                  </Link>
                )}
                
                {hasManagerialAccess && (
                  <>
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
              </>
            )}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
