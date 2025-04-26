
import { Link } from "react-router-dom"
import { 
  Home, User, FileText, ClipboardCheck, Clock,
  DollarSign, Calendar, Users, Utensils, Receipt 
} from "lucide-react"

interface NavLinksProps {
  isAuthenticated: boolean;
  hasManagerialAccess: boolean;
  isEmployee: boolean;
  onLinkClick: () => void;
}

export const NavLinks = ({ 
  isAuthenticated, 
  hasManagerialAccess, 
  isEmployee,
  onLinkClick 
}: NavLinksProps) => {
  return (
    <nav className="grid gap-1 px-2 py-2">
      <Link
        to="/dashboard"
        onClick={onLinkClick}
        className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
      >
        <Home className="mr-3 h-5 w-5 text-neutral-600" />
        <span>Home</span>
      </Link>
      
      <Link
        to="/about"
        onClick={onLinkClick}
        className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
      >
        <FileText className="mr-3 h-5 w-5 text-neutral-600" />
        <span>About</span>
      </Link>
      
      <Link
        to="/contact"
        onClick={onLinkClick}
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
              onClick={onLinkClick}
              className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
            >
              <ClipboardCheck className="mr-3 h-5 w-5 text-neutral-600" />
              <span>Attendance</span>
            </Link>
          )}
          
          <Link
            to="/employee-workflow"
            onClick={onLinkClick}
            className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
          >
            <Clock className="mr-3 h-5 w-5 text-neutral-600" />
            <span>{hasManagerialAccess ? 'My Employee Shifts' : 'My Schedule'}</span>
          </Link>

          {hasManagerialAccess && (
            <>
              <Link
                to="/people"
                onClick={onLinkClick}
                className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
              >
                <Users className="mr-3 h-5 w-5 text-neutral-600" />
                <span>Employees</span>
              </Link>
              
              <Link
                to="/shift-calendar"
                onClick={onLinkClick}
                className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
              >
                <Utensils className="mr-3 h-5 w-5 text-neutral-600" />
                <span>Shift Calendar</span>
              </Link>
            </>
          )}

          <Link
            to="/leave-management"
            onClick={onLinkClick}
            className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
          >
            <Calendar className="mr-3 h-5 w-5 text-neutral-600" />
            <span>Leave & Schedule</span>
          </Link>
          
          {isEmployee && (
            <Link
              to="/salary"
              onClick={onLinkClick}
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
                onClick={onLinkClick}
                className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
              >
                <DollarSign className="mr-3 h-5 w-5 text-neutral-600" />
                <span>Salary</span>
              </Link>
              
              <Link
                to="/payroll"
                onClick={onLinkClick}
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
  );
};
