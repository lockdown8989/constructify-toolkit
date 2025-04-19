import { Link, useNavigate } from "react-router-dom"
import { Calendar, DollarSign, Receipt, Clock, Home, ClipboardCheck, Coffee } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTimeClock } from "@/hooks/time-clock"
import { useEmployeeSchedule } from "@/hooks/use-employee-schedule"

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const navigate = useNavigate();
  const { isManager, isAdmin, isHR, user } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  const isClockingEnabled = !hasManagerialAccess && isAuthenticated;
  const { schedules = [] } = useEmployeeSchedule();

  const pendingCount = schedules?.filter(s => s.status === 'pending').length || 0;
  const acceptedCount = schedules?.filter(s => s.status === 'confirmed').length || 0;
  const rejectedCount = schedules?.filter(s => s.status === 'rejected').length || 0;
  
  const handleHomeClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="mx-auto flex items-center space-x-6">
      {isClockingEnabled && (
        <div className="flex items-center space-x-2 border-r pr-4 mr-2">
          {status === 'clocked-out' ? (
            <Button 
              onClick={handleClockIn}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          ) : status === 'clocked-in' ? (
            <div className="flex space-x-2">
              <Button 
                onClick={handleBreakStart}
                size="sm"
                variant="outline"
                className="border-blue-300"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Break
              </Button>
              <Button 
                onClick={handleClockOut}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleBreakEnd}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              End Break
            </Button>
          )}
        </div>
      )}
      
      <button 
        onClick={handleHomeClick} 
        className="hover:underline underline-offset-4 flex items-center"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </button>
      
      <Link
        to="/about"
        className="hover:underline underline-offset-4"
      >
        About
      </Link>
      <Link
        to="/contact"
        className="hover:underline underline-offset-4"
      >
        Contact
      </Link>
      {isAuthenticated && (
        <>
          {hasManagerialAccess ? (
            <>
              <Link
                to="/attendance"
                className="hover:underline underline-offset-4 flex items-center"
              >
                <ClipboardCheck className="h-4 w-4 mr-1" />
                Attendance
              </Link>
              <Link
                to="/employee-workflow"
                className="hover:underline underline-offset-4 flex items-center group relative"
              >
                <Clock className="h-4 w-4 mr-1" />
                My Employee Shifts
                <div className="flex gap-1 ml-2">
                  {acceptedCount > 0 && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center">
                      {acceptedCount}
                    </Badge>
                  )}
                  {pendingCount > 0 && (
                    <Badge variant="outline" className="flex items-center">
                      {pendingCount} pending
                    </Badge>
                  )}
                </div>
              </Link>
              <Link
                to="/people"
                className="hover:underline underline-offset-4"
              >
                Employees
              </Link>
              <Link
                to="/shift-calendar"
                className="hover:underline underline-offset-4"
              >
                Shift Calendar
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/employee-workflow"
                className="hover:underline underline-offset-4 flex items-center"
              >
                <Clock className="h-4 w-4 mr-1" />
                My Schedule
              </Link>
              <Link
                to="/time-clock"
                className="hover:underline underline-offset-4 flex items-center"
              >
                <Clock className="h-4 w-4 mr-1" />
                Time Clock
              </Link>
            </>
          )}
          <Link
            to="/leave"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Leave & Schedule
          </Link>
          {hasManagerialAccess && (
            <>
              <Link
                to="/salary"
                className="hover:underline underline-offset-4 flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Salary
              </Link>
              <Link
                to="/payroll"
                className="hover:underline underline-offset-4 flex items-center"
              >
                <Receipt className="h-4 w-4 mr-1" />
                Payslip
              </Link>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DesktopNav;
