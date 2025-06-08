
import React from 'react';
import { Home, Users, Calendar, FileText, ClipboardList, Clock, User, Settings, UserCheck } from 'lucide-react';
import MobileNavLink from './MobileNavLink';
import PayrollSection from './PayrollSection';

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
  // Debug log to check payroll role in mobile nav
  console.log("CommonSection - isPayroll:", isPayroll);
  console.log("CommonSection - isAuthenticated:", isAuthenticated);
  console.log("CommonSection - hasManagerialAccess:", hasManagerialAccess);

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

      {/* Employee Management - For Managers/HR/Admin only (excluding payroll users) */}
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

      {/* Payroll Section - Only for Payroll users */}
      {isAuthenticated && isPayroll && (
        <>
          {console.log("Rendering PayrollSection - isPayroll is true")}
          <PayrollSection onClose={onClose} />
        </>
      )}

      {/* Employee Workflow - For employees only (not payroll users) */}
      {isEmployee && !isPayroll && (
        <MobileNavLink 
          to="/employee-workflow" 
          icon={ClipboardList} 
          label="Workflow" 
          onClick={onClose} 
        />
      )}

      {/* Restaurant Schedule - For Managers only (not payroll users) */}
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
