
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
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
  Calculator
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

      {/* Payroll users get a special payroll dashboard */}
      {isPayroll && (
        <SidebarNavLink
          to="/payroll-dashboard"
          icon={Calculator}
          label="Payroll Dashboard"
          isActive={location.pathname === "/payroll-dashboard"}
          isCollapsed={false}
        />
      )}

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
        to="/leave"
        icon={FileText}
        label="Leave"
        isActive={location.pathname === "/leave"}
        isCollapsed={false}
      />

      {/* Salary - All users can see their salary */}
      <SidebarNavLink
        to="/salary"
        icon={DollarSign}
        label="Salary"
        isActive={location.pathname === "/salary"}
        isCollapsed={false}
      />

      {/* Payroll - For Managers/HR/Admin/Payroll */}
      {(hasManagerialAccess || isPayroll) && (
        <SidebarNavLink
          to="/payroll"
          icon={Calculator}
          label="Payroll"
          isActive={location.pathname === "/payroll"}
          isCollapsed={false}
        />
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
