import { Home, Users, Calendar, DollarSign, Utensils, ClipboardCheck, Clock, Coffee } from "lucide-react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/auth"
import { Button } from "@/components/ui/button"
import { useTimeClock } from "@/hooks/time-clock"

interface BottomNavProps {
  isAuthenticated: boolean;
}

const BottomNav = ({ isAuthenticated }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  const isClockingEnabled = !hasManagerialAccess && isAuthenticated;
  
  if (!isAuthenticated) return null;
  
  const handleHomeClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-inset py-2 md:hidden">
      {isClockingEnabled && (
        <div className="px-4 mb-2">
          {status === 'clocked-out' ? (
            <Button 
              onClick={handleClockIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              <Clock className="h-4 w-4 mr-2" />
              Clock In For Shift
            </Button>
          ) : status === 'clocked-in' ? (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleBreakStart}
                variant="outline"
                className="border-blue-300"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Start Break
              </Button>
              <Button 
                onClick={handleClockOut}
                className="bg-red-600 hover:bg-red-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleBreakEnd}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              End Break
            </Button>
          )}
        </div>
      )}
      
      <div className={cn("grid gap-1", hasManagerialAccess ? "grid-cols-6" : "grid-cols-5")}>
        <div 
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center p-2 cursor-pointer"
        >
          <Home 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/dashboard" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            Home
          </span>
        </div>
        
        {hasManagerialAccess && (
          <Link to="/attendance" className="flex flex-col items-center justify-center p-2">
            <ClipboardCheck 
              className={cn(
                "h-6 w-6 mb-1", 
                location.pathname === "/attendance" ? "text-primary" : "text-muted-foreground"
              )} 
            />
            <span className={cn(
              "text-xs", 
              location.pathname === "/attendance" ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              Attendance
            </span>
          </Link>
        )}
        
        <Link to="/people" className="flex flex-col items-center justify-center p-2">
          <Users 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/people" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/people" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            Team
          </span>
        </Link>
        
        <Link to="/shift-calendar" className="flex flex-col items-center justify-center p-2">
          <Utensils 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/shift-calendar" || location.pathname === "/restaurant-schedule" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/shift-calendar" || location.pathname === "/restaurant-schedule" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            Schedule
          </span>
        </Link>
        
        <Link to="/leave-management" className="flex flex-col items-center justify-center p-2">
          <Calendar 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/leave-management" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/leave-management" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            Leave
          </span>
        </Link>
        
        <Link to="/salary" className="flex flex-col items-center justify-center p-2">
          <DollarSign 
            className={cn(
              "h-6 w-6 mb-1", 
              location.pathname === "/salary" ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs", 
            location.pathname === "/salary" ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            Salary
          </span>
        </Link>
        
        {!hasManagerialAccess && (
          <Link to="/time-clock" className="flex flex-col items-center justify-center p-2">
            <Clock 
              className={cn(
                "h-6 w-6 mb-1", 
                location.pathname === "/time-clock" ? "text-primary" : "text-muted-foreground"
              )} 
            />
            <span className={cn(
              "text-xs", 
              location.pathname === "/time-clock" ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              Time Clock
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomNav;
