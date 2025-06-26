
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
  Timer,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { SidebarNavLink } from './SidebarNavLink';

export const NavigationLinks = () => {
  const { isAdmin, isManager, isHR, isPayroll } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;

  return (
    <div className="space-y-1">
      {/* Common Navigation Items */}
      <SidebarNavLink to="/dashboard" icon={BarChart3} label="Dashboard" />
      <SidebarNavLink to="/schedule" icon={Calendar} label="Schedule" />
      <SidebarNavLink to="/time-clock" icon={Clock} label="Time Clock" />
      <SidebarNavLink to="/attendance" icon={UserCheck} label="Attendance" />
      <SidebarNavLink to="/salary" icon={DollarSign} label="Salary" />
      <SidebarNavLink to="/leave-management" icon={FileText} label="Leave Management" />
      <SidebarNavLink to="/schedule-requests" icon={Bell} label="Schedule Requests" />
      <SidebarNavLink to="/employee-workflow" icon={ClipboardList} label="Employee Workflow" />

      {/* Manager/Admin Only Items */}
      {hasManagerAccess && (
        <>
          <SidebarNavLink to="/people" icon={Users} label="People" />
          <SidebarNavLink to="/shift-calendar" icon={CalendarDays} label="Shift Calendar" />
          <SidebarNavLink to="/shift-patterns" icon={Timer} label="Shift Patterns" />
          <SidebarNavLink to="/restaurant-schedule" icon={Building2} label="Restaurant Schedule" />
          <SidebarNavLink to="/manager-time-clock" icon={Clock} label="Manager Time Clock" />
          <SidebarNavLink to="/payroll" icon={DollarSign} label="Payroll" />
          <SidebarNavLink to="/hiring" icon={Briefcase} label="Hiring" />
        </>
      )}

      {/* Payroll Specific Items */}
      {isPayroll && (
        <>
          <SidebarNavLink to="/payroll-dashboard" icon={BarChart3} label="Payroll Dashboard" />
          <SidebarNavLink to="/payslips" icon={FileText} label="Payslips" />
        </>
      )}

      {/* Settings */}
      <SidebarNavLink to="/settings" icon={Settings} label="Settings" />
    </div>
  );
};
