
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

      {/* Employee Management - For Managers/HR/Admin */}
      {hasManagerialAccess && (
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

      {/* Payroll Section - Only for Payroll users */}
      {isPayroll && (
        <>
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

      {/* Employee Workflow - For employees */}
      {isEmployee && (
        <SidebarNavLink
          to="/employee-workflow"
          icon={ClipboardList}
          label="Workflow"
          isActive={location.pathname === "/employee-workflow"}
          isCollapsed={false}
        />
      )}

      {/* Restaurant Schedule - For Managers */}
      {hasManagerialAccess && (
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
