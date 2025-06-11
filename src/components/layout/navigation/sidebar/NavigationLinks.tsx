
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import SidebarNavLink from './SidebarNavLink';
import SidebarDivider from './SidebarDivider';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  ClipboardList, 
  Clock, 
  User, 
  Settings,
  UserCheck,
  Calculator,
  Wallet,
  BarChart3
} from 'lucide-react';

const NavigationLinks = () => {
  const location = useLocation();
  const { isAdmin, isHR, isManager, isEmployee, isPayroll } = useAuth();
  
  // Exclude payroll users from managerial access
  const hasManagerialAccess = (isManager || isAdmin || isHR) && !isPayroll;

  // Debug log to check payroll role
  console.log("NavigationLinks - isPayroll:", isPayroll);
  console.log("NavigationLinks - hasManagerialAccess:", hasManagerialAccess);

  return (
    <nav className="px-3 space-y-1">
      {/* Dashboard */}
      <SidebarNavLink
        to="/dashboard"
        icon={Home}
        label="Dashboard"
        isActive={location.pathname === "/dashboard"}
        isCollapsed={false}
      />

      <SidebarDivider isCollapsed={false} />

      {/* Manager-specific navigation - synchronized with mobile */}
      {hasManagerialAccess && (
        <>
          <SidebarNavLink
            to="/restaurant-schedule"
            icon={Clock}
            label="Restaurant Schedule"
            isActive={location.pathname === "/restaurant-schedule"}
            isCollapsed={false}
          />
          
          <SidebarNavLink
            to="/manager-time-clock"
            icon={Clock}
            label="IN AND OUT"
            isActive={location.pathname === "/manager-time-clock"}
            isCollapsed={false}
            className="time-clock-nav-button"
          />
          
          <SidebarNavLink
            to="/attendance"
            icon={UserCheck}
            label="Attendance"
            isActive={location.pathname === "/attendance"}
            isCollapsed={false}
          />
          
          <SidebarNavLink
            to="/people"
            icon={Users}
            label="Team Members"
            isActive={location.pathname === "/people"}
            isCollapsed={false}
          />
          
          <SidebarNavLink
            to="/schedule"
            icon={Calendar}
            label="Schedule Calendar"
            isActive={location.pathname === "/schedule"}
            isCollapsed={false}
          />
          
          <SidebarDivider isCollapsed={false} />
        </>
      )}

      {/* Schedule Management - For all users */}
      {!hasManagerialAccess && (
        <SidebarNavLink
          to="/schedule"
          icon={Calendar}
          label="Schedule"
          isActive={location.pathname === "/schedule"}
          isCollapsed={false}
        />
      )}

      {/* Leave Management */}
      <SidebarNavLink
        to="/leave-management"
        icon={FileText}
        label="Leave"
        isActive={location.pathname === "/leave-management"}
        isCollapsed={false}
      />

      {/* Payroll Section - Only for Payroll users */}
      {isPayroll && (
        <>
          {console.log("Rendering payroll sidebar links - isPayroll is true")}
          <SidebarDivider isCollapsed={false} />
          
          <SidebarNavLink
            to="/payroll"
            icon={Calculator}
            label="Payroll"
            isActive={location.pathname === "/payroll"}
            isCollapsed={false}
          />

          <SidebarNavLink
            to="/salary"
            icon={DollarSign}
            label="Salary"
            isActive={location.pathname === "/salary"}
            isCollapsed={false}
          />

          <SidebarNavLink
            to="/payslips"
            icon={Wallet}
            label="Payslips"
            isActive={location.pathname === "/payslips"}
            isCollapsed={false}
          />
        </>
      )}

      <SidebarDivider isCollapsed={false} />

      {/* Employee Workflow - For employees (not payroll users) */}
      {isEmployee && !isPayroll && (
        <SidebarNavLink
          to="/employee-workflow"
          icon={ClipboardList}
          label="Workflow"
          isActive={location.pathname === "/employee-workflow"}
          isCollapsed={false}
        />
      )}

      <SidebarDivider isCollapsed={false} />

      {/* Profile */}
      <SidebarNavLink
        to="/profile"
        icon={User}
        label="Profile"
        isActive={location.pathname === "/profile"}
        isCollapsed={false}
      />

      {/* Settings */}
      <SidebarNavLink
        to="/settings"
        icon={Settings}
        label="Settings"
        isActive={location.pathname === "/settings"}
        isCollapsed={false}
      />
    </nav>
  );
};

export default NavigationLinks;
