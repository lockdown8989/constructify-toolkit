import { Link } from "react-router-dom"
import { Calendar, DollarSign, Receipt, Clock, Check, X } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { useEmployeeSchedule } from "@/hooks/use-employee-schedule"
import { Badge } from "@/components/ui/badge"

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const { schedules } = useEmployeeSchedule();
  
  // Calculate pending, accepted, and rejected counts
  const pendingCount = schedules?.filter(s => s.status === 'pending').length || 0;
  const acceptedCount = schedules?.filter(s => s.status === 'confirmed').length || 0;
  const rejectedCount = schedules?.filter(s => s.status === 'rejected').length || 0;
  
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
      {isAuthenticated && (
        <>
          {hasManagerialAccess ? (
            <Link
              to="/employee-workflow"
              className="hover:underline underline-offset-4 flex items-center group relative"
            >
              <Clock className="h-4 w-4 mr-1" />
              My Employee Shifts
              <div className="flex gap-1 ml-2">
                {acceptedCount > 0 && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    {acceptedCount}
                  </Badge>
                )}
                {rejectedCount > 0 && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {rejectedCount}
                  </Badge>
                )}
                {pendingCount > 0 && (
                  <Badge variant="outline" className="flex items-center">
                    {pendingCount} pending
                  </Badge>
                )}
              </div>
            </Link>
          ) : (
            <Link
              to="/employee-workflow"
              className="hover:underline underline-offset-4 flex items-center"
            >
              <Clock className="h-4 w-4 mr-1" />
              My Schedule
            </Link>
          )}
          <Link
            to="/people"
            className="hover:underline underline-offset-4"
          >
            Employees
          </Link>
          <Link
            to="/employee-workflow"
            className="hover:underline underline-offset-4"
          >
            Employee Workflow
          </Link>
          <Link
            to="/leave"
            className="hover:underline underline-offset-4 flex items-center"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Leave & Schedule
          </Link>
          <Link
            to="/shift-calendar"
            className="hover:underline underline-offset-4"
          >
            Shift Calendar
          </Link>
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
    </div>
  );
};

export default DesktopNav;
