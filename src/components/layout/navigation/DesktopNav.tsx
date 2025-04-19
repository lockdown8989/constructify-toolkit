
import { Link } from "react-router-dom"
import { Users, Calendar, DollarSign, Clock, History } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { useEmployeeSchedule } from "@/hooks/use-employee-schedule"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const { schedules } = useEmployeeSchedule();
  
  // Calculate pending, accepted, and rejected counts
  const pendingCount = schedules?.filter(s => s.status === 'pending').length || 0;
  
  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex items-center space-x-6">
        <Link to="/" className="hover:underline underline-offset-4">
          Home
        </Link>
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
      </div>
    );
  }

  return (
    <div className="mx-auto flex items-center space-x-6">
      <Link to="/" className="hover:underline underline-offset-4">
        Home
      </Link>
      
      {hasManagerialAccess ? (
        <>
          <Link
            to="/people"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Users className="h-4 w-4 mr-1" />
            Team
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
            <Users className="h-4 w-4 mr-1" />
            Employee View
          </Link>
          <Link
            to="/shift-history"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <History className="h-4 w-4 mr-1" />
            Shift History
          </Link>
          <Link
            to="/calendar-view"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Calendar View
          </Link>
          <Link
            to="/schedule-requests"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Clock className="h-4 w-4 mr-1" />
            Schedule Requests
            {pendingCount > 0 && (
              <Badge variant="outline" className="ml-2 flex items-center">
                {pendingCount}
              </Badge>
            )}
          </Link>
        </>
      )}

      {hasManagerialAccess && (
        <>
          <Link
            to="/salary"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Salary
          </Link>
        </>
      )}
    </div>
  );
};

export default DesktopNav;
