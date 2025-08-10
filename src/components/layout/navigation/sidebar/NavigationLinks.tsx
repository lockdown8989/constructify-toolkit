
import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  UserCheck,
  DollarSign,
  Bell,
  CalendarDays,
  ClipboardList,
  Building2,
  Timer
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'react-router-dom';
import SidebarNavLink from './SidebarNavLink';

export const NavigationLinks = () => {
  const { isAdmin, isManager, isHR, isPayroll } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-1">
      {/* Common Navigation Items */}
      <SidebarNavLink to="/dashboard" icon={BarChart3} label="Dashboard" isActive={isActive('/dashboard')} isCollapsed={false} />
      <SidebarNavLink to="/attendance" icon={UserCheck} label="Attendance" isActive={isActive('/attendance')} isCollapsed={false} />
      <SidebarNavLink to="/leave-management" icon={FileText} label="Leave Management" isActive={isActive('/leave-management')} isCollapsed={false} />
      <SidebarNavLink to="/schedule-requests" icon={Bell} label="Schedule Requests" isActive={isActive('/schedule-requests')} isCollapsed={false} />
      

      {/* Manager/Admin Only Items */}
      {hasManagerAccess && (
        <>
          <SidebarNavLink to="/people" icon={Users} label="People" isActive={isActive('/people')} isCollapsed={false} />
          <SidebarNavLink to="/shift-calendar" icon={CalendarDays} label="Shift Calendar" isActive={isActive('/shift-calendar')} isCollapsed={false} />
          <SidebarNavLink to="/rota-employee" icon={Timer} label="Employee Rotas" isActive={isActive('/rota-employee')} isCollapsed={false} />
          <SidebarNavLink to="/employee-workflow" icon={ClipboardList} label="Employee Workflow" isActive={isActive('/employee-workflow')} isCollapsed={false} />
          <SidebarNavLink to="/manager-time-clock" icon={Clock} label="Manager Time Clock" isActive={isActive('/manager-time-clock')} isCollapsed={false} />
        </>
      )}

      {/* Payroll Specific Items - Only for dedicated payroll users */}
      {isPayroll && (
        <>
          <SidebarNavLink to="/payroll" icon={DollarSign} label="Payroll" isActive={isActive('/payroll')} isCollapsed={false} />
          <SidebarNavLink to="/payroll-dashboard" icon={BarChart3} label="Payroll Dashboard" isActive={isActive('/payroll-dashboard')} isCollapsed={false} />
          <SidebarNavLink to="/payroll-reports" icon={FileText} label="Payroll Reports" isActive={isActive('/payroll-reports')} isCollapsed={false} />
          <SidebarNavLink to="/payslips" icon={FileText} label="Payslips" isActive={isActive('/payslips')} isCollapsed={false} />
        </>
      )}
    </div>
  );
};
