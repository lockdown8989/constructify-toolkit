
import React from 'react';
import { Home, Users, Calendar, FileText, DollarSign, ClipboardList, Clock, User, Settings, UserCheck, Calculator } from 'lucide-react';
import MobileNavLink from './MobileNavLink';

interface CommonSectionProps {
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  isPayroll: boolean;
  onClose: () => void;
}

const CommonSection: React.FC<CommonSectionProps> = ({ 
  isAuthenticated, 
  isEmployee, 
  hasManagerialAccess, 
  isPayroll,
  onClose 
}) => {
  return (
    <>
      {isAuthenticated && (
        <MobileNavLink 
          to="/dashboard" 
          icon={Home} 
          label="Dashboard" 
          onClick={onClose} 
        />
      )}

      {/* Employee Management - For Managers/HR/Admin */}
      {hasManagerialAccess && (
        <>
          <MobileNavLink 
            to="/people" 
            icon={Users} 
            label="People" 
            onClick={onClose} 
          />
          
          <MobileNavLink 
            to="/attendance" 
            icon={UserCheck} 
            label="Attendance" 
            onClick={onClose} 
          />
        </>
      )}

      {/* Schedule Management */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/schedule" 
          icon={Calendar} 
          label="Schedule" 
          onClick={onClose} 
        />
      )}

      {/* Leave Management */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/leave-management" 
          icon={FileText} 
          label="Leave" 
          onClick={onClose} 
        />
      )}

      {/* Salary - Only for Payroll users */}
      {isPayroll && (
        <MobileNavLink 
          to="/salary" 
          icon={DollarSign} 
          label="Salary" 
          onClick={onClose} 
        />
      )}

      {/* Payroll - Only for Payroll users */}
      {isPayroll && (
        <MobileNavLink 
          to="/payroll" 
          icon={Calculator} 
          label="Payroll" 
          onClick={onClose} 
        />
      )}

      {/* Employee Workflow - For employees */}
      {isEmployee && (
        <MobileNavLink 
          to="/employee-workflow" 
          icon={ClipboardList} 
          label="Workflow" 
          onClick={onClose} 
        />
      )}

      {/* Restaurant Schedule - For Managers */}
      {hasManagerialAccess && (
        <MobileNavLink 
          to="/restaurant-schedule" 
          icon={Clock} 
          label="Restaurant Schedule" 
          onClick={onClose} 
        />
      )}

      {/* Profile */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/profile" 
          icon={User} 
          label="Profile" 
          onClick={onClose} 
        />
      )}

      {/* Settings */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/settings" 
          icon={Settings} 
          label="Settings" 
          onClick={onClose} 
        />
      )}
    </>
  );
};

export default CommonSection;
