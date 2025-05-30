
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
        icon={<Home className="w-5 h-5" />}
        label="Dashboard"
        isActive={location.pathname === "/dashboard"}
      />

      {/* Payroll users get a special payroll dashboard */}
      {isPayroll && (
        <SidebarNavLink
          to="/payroll-dashboard"
          icon={<Calculator className="w-5 h-5" />}
          label="Payroll Dashboard"
          isActive={location.pathname === "/payroll-dashboard"}
        />
      )}

      <SidebarDivider />

      {/* Employee Management - For Managers/HR/Admin */}
      {hasManagerialAccess && (
        <>
          <SidebarNavLink
            to="/people"
            icon={<Users className="w-5 h-5" />}
            label="People"
            isActive={location.pathname === "/people"}
          />
          
          <SidebarNavLink
            to="/attendance"
            icon={<UserCheck className="w-5 h-5" />}
            label="Attendance"
            isActive={location.pathname === "/attendance"}
          />
        </>
      )}

      {/* Schedule Management */}
      <SidebarNavLink
        to="/schedule"
        icon={<Calendar className="w-5 h-5" />}
        label="Schedule"
        isActive={location.pathname === "/schedule"}
      />

      {/* Leave Management */}
      <SidebarNavLink
        to="/leave"
        icon={<FileText className="w-5 h-5" />}
        label="Leave"
        isActive={location.pathname === "/leave"}
      />

      {/* Salary - All users can see their salary */}
      <SidebarNavLink
        to="/salary"
        icon={<DollarSign className="w-5 h-5" />}
        label="Salary"
        isActive={location.pathname === "/salary"}
      />

      {/* Payroll - For Managers/HR/Admin/Payroll */}
      {(hasManagerialAccess || isPayroll) && (
        <SidebarNavLink
          to="/payroll"
          icon={<Calculator className="w-5 h-5" />}
          label="Payroll"
          isActive={location.pathname === "/payroll"}
        />
      )}

      <SidebarDivider />

      {/* Employee Workflow - For employees */}
      {isEmployee && (
        <SidebarNavLink
          to="/employee-workflow"
          icon={<ClipboardList className="w-5 h-5" />}
          label="Workflow"
          isActive={location.pathname === "/employee-workflow"}
        />
      )}

      {/* Restaurant Schedule - For Managers */}
      {hasManagerialAccess && (
        <SidebarNavLink
          to="/restaurant-schedule"
          icon={<Clock className="w-5 h-5" />}
          label="Restaurant Schedule"
          isActive={location.pathname === "/restaurant-schedule"}
        />
      )}

      <SidebarDivider />

      {/* Profile */}
      <SidebarNavLink
        to="/profile"
        icon={<User className="w-5 h-5" />}
        label="Profile"
        isActive={location.pathname === "/profile"}
      />

      {/* Settings */}
      <SidebarNavLink
        to="/settings"
        icon={<Settings className="w-5 h-5" />}
        label="Settings"
        isActive={location.pathname === "/settings"}
      />
    </nav>
  );
};

export default NavigationLinks;
