
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Calculator,
  ClipboardList,
  Clock,
  CalendarDays,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const DesktopNav = () => {
  const { isAuthenticated, isAdmin, isHR, isManager, isPayroll } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  // Calculate derived properties
  const hasManagerialAccess = (isManager || isAdmin || isHR) && !isPayroll;

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children, className }: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900",
        isActive(to) ? "bg-gray-100 text-gray-900" : "text-gray-700",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="space-y-1 px-2">
      <NavLink to="/dashboard" icon={LayoutDashboard}>
        Dashboard
      </NavLink>

      {/* Schedule for non-managers and non-payroll users */}
      {!hasManagerialAccess && !isPayroll && (
        <NavLink to="/schedule" icon={Calendar}>
          Schedule
        </NavLink>
      )}

      {/* Attendance for all authenticated users */}
      <NavLink to="/attendance" icon={UserCheck}>
        Attendance
      </NavLink>

      {/* Leave for all authenticated users */}
      <NavLink to="/leave-management" icon={FileText}>
        Leave
      </NavLink>

      {/* Manager-only sections */}
      {hasManagerialAccess && (
        <>
          <NavLink to="/people" icon={Users}>
            Team Members
          </NavLink>
          <NavLink to="/rota-employee" icon={Clock}>
            Employee Rotas
          </NavLink>
          <NavLink to="/shift-calendar" icon={CalendarDays}>
            Shift Calendar
          </NavLink>
          <NavLink to="/shift-patterns" icon={Clock}>
            Shift Patterns
          </NavLink>
          <NavLink to="/manager-time-clock" icon={Clock}>
            Manager Time Clock
          </NavLink>
        </>
      )}

      {/* Payroll-only sections */}
      {isPayroll && (
        <>
          <NavLink to="/payroll-dashboard" icon={Calculator}>
            Payroll Dashboard
          </NavLink>
          <NavLink to="/payslips" icon={ClipboardList}>
            Payslips
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default DesktopNav;
