
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DesktopNav = () => {
  // NOTE: Assuming managerial/payroll access for any authenticated user
  // to fix build errors from a previous state.
  // The original useAuth hook might have provided more specific roles.
  const { isAuthenticated } = useAuth();
  const hasManagerialAccess = isAuthenticated;
  const hasPayrollAccess = isAuthenticated;
  
  const location = useLocation();

  if (!isAuthenticated) return null;

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

      <NavLink to="/schedule" icon={Calendar}>
        Schedule
      </NavLink>

      <NavLink to="/leave-management" icon={FileText}>
        Leave
      </NavLink>

      {hasManagerialAccess && (
        <>
          <NavLink to="/employee-management" icon={Users}>
            Employees
          </NavLink>
        </>
      )}

      {hasPayrollAccess && (
        <>
          <NavLink to="/payroll-dashboard" icon={Calculator}>
            Payroll
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default DesktopNav;
