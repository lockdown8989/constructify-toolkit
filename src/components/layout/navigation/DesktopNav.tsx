
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
  BarChart3,
  Clock,
  CalendarDays,
  Briefcase,
  FolderOpen,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const DesktopNav = () => {
  const { isAuthenticated, isAdmin, isHR, isManager, isPayroll } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  // Calculate derived properties
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const hasPayrollAccess = isPayroll;

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

      {!hasManagerialAccess && !hasPayrollAccess && (
        <NavLink to="/schedule" icon={Calendar}>
          Schedule
        </NavLink>
      )}

      <NavLink to="/leave-management" icon={FileText}>
        Leave
      </NavLink>

      {hasManagerialAccess && (
        <>
          <NavLink to="/employee-management" icon={Users}>
            Employees
          </NavLink>
          <NavLink to="/attendance-manager" icon={Clock}>
            Attendance
          </NavLink>
          <NavLink to="/shift-calendar" icon={CalendarDays}>
            Calendar
          </NavLink>
          <NavLink to="/open-shifts" icon={Briefcase}>
            Open Shifts
          </NavLink>
          <NavLink to="/shift-patterns" icon={Clock}>
            Shift Patterns
          </NavLink>
          <NavLink to="/documents-manager" icon={FolderOpen}>
            Documents
          </NavLink>
          <NavLink to="/reports" icon={BarChart3}>
            Reports
          </NavLink>
        </>
      )}

      {hasPayrollAccess && (
        <>
          <NavLink to="/payroll-dashboard" icon={Calculator}>
            Payroll
          </NavLink>
          <NavLink to="/payroll-history" icon={ClipboardList}>
            History
          </NavLink>
          <NavLink to="/payroll-summary" icon={BarChart3}>
            Summary
          </NavLink>
        </>
      )}

      <NavLink to="/notifications" icon={Bell}>
        Notifications
      </NavLink>
    </nav>
  );
};

export default DesktopNav;
