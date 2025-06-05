
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
  Wallet
} from 'lucide-react';

const NavigationLinks = () => {
  const location = useLocation();
  const { isAdmin, isHR, isManager, isEmployee, isPayroll } = useAuth();
  
  const hasManagerialAccess = isManager || isAdmin || isHR;

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

      {/* Employee Management - For Managers/HR/Admin (not payroll users) */}
      {hasManagerialAccess && !isPayroll && (
        <>
          <SidebarNavLink
            to="/people"
            icon={Users}
            label="People"
            isActive={location.pathname === "/people"}
            isCollapsed={false}
          />
          
          <SidebarNavLink
            to="/attendance"
            icon={UserCheck}
            label="Attendance"
            isActive={location.pathname === "/attendance"}
            isCollapsed={false}
          />
        </>
      )}

      {/* Schedule Management */}
      <SidebarNavLink
        to="/schedule"
        icon={Calendar}
        label="Schedule"
        isActive={location.pathname === "/schedule"}
        isCollapsed={false}
      />

      {/* Leave Management */}
      <SidebarNavLink
        to="/leave-management"
        icon={FileText}
        label="Leave"
        isActive={location.pathname === "/leave-management"}
        isCollapsed={false}
      />

      {/* Manager Time Clock with IN/OUT buttons - Only for managers (not payroll users) */}
      {hasManagerialAccess && !isPayroll && (
        <SidebarNavLink
          to="/manager-time-clock"
          icon={Clock}
          label="Time Clock"
          isActive={location.pathname === "/manager-time-clock"}
          isCollapsed={false}
        />
      )}

      {/* Payroll Section - Only for Payroll users */}
      {isPayroll && (
        <>
          <SidebarDivider isCollapsed={false} />
          
          <SidebarNavLink
            to="/payroll-dashboard"
            icon={Calculator}
            label="Payroll"
            isActive={location.pathname === "/payroll-dashboard"}
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

      {/* Restaurant Schedule - For Managers (not payroll users) */}
      {hasManagerialAccess && !isPayroll && (
        <SidebarNavLink
          to="/restaurant-schedule"
          icon={Clock}
          label="Restaurant Schedule"
          isActive={location.pathname === "/restaurant-schedule"}
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
