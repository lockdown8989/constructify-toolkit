
import React from 'react';
import { LayoutDashboard, FileText, UserCheck, Users, History, Calendar, Clock } from "lucide-react";
import MobileNavLink from "./MobileNavLink";

interface CommonSectionProps {
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  isPayroll: boolean;
  onClose: () => void;
}

const CommonSection = ({ 
  isAuthenticated, 
  isEmployee, 
  hasManagerialAccess, 
  isPayroll, 
  onClose 
}: CommonSectionProps) => {
  if (!isAuthenticated) return null;

  return (
    <>
      <MobileNavLink
        to="/dashboard"
        icon={LayoutDashboard}
        label="🏠 Dashboard"
        onClick={onClose}
      />

      {/* Schedule for non-managers and non-payroll users */}
      {!hasManagerialAccess && !isPayroll && (
        <MobileNavLink
          to="/schedule"
          icon={LayoutDashboard}
          label="📅 My Schedule"
          onClick={onClose}
        />
      )}

      {/* Attendance for all authenticated users */}
      <MobileNavLink
        to="/attendance"
        icon={UserCheck}
        label="📊 Attendance"
        onClick={onClose}
      />

      {/* Leave Management options for employees */}
      {!hasManagerialAccess && !isPayroll && (
        <>
          <MobileNavLink
            to="/leave-management"
            state={{ initialView: "employee" }}
            icon={Users}
            label="📋 Employee View"
            onClick={onClose}
          />
          <MobileNavLink
            to="/leave-management"
            state={{ initialView: "shift-history" }}
            icon={History}
            label="📊 Shift History"
            onClick={onClose}
          />
          <MobileNavLink
            to="/leave-management"
            state={{ initialView: "calendar" }}
            icon={Calendar}
            label="📅 Calendar View"
            onClick={onClose}
          />
          <MobileNavLink
            to="/leave-management"
            state={{ initialView: "schedule-requests" }}
            icon={Clock}
            label="⏰ Schedule Requests"
            onClick={onClose}
          />
        </>
      )}

      {/* Leave Management for managers */}
      {hasManagerialAccess && (
        <MobileNavLink
          to="/leave-management"
          icon={FileText}
          label="📋 Leave Management"
          onClick={onClose}
        />
      )}

      {/* Payroll sections - only for payroll users */}
      {isPayroll && (
        <>
          <MobileNavLink
            to="/payroll-dashboard"
            icon={LayoutDashboard}
            label="💰 Payroll Dashboard"
            onClick={onClose}
          />
          <MobileNavLink
            to="/payroll-reports"
            icon={FileText}
            label="📊 Reports"
            onClick={onClose}
          />
          <MobileNavLink
            to="/payslips"
            icon={FileText}
            label="📄 Payslips"
            onClick={onClose}
          />
        </>
      )}
    </>
  );
};

export default CommonSection;
