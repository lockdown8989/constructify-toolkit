
import React from 'react';
import { Home, Users, Calendar, FileText, DollarSign, ClipboardList, Clock, User, Settings, UserCheck, Calculator } from 'lucide-react';
import MobileNavLink from './MobileNavLink';

interface CommonSectionProps {
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const CommonSection: React.FC<CommonSectionProps> = ({ 
  isAuthenticated, 
  isEmployee, 
  hasManagerialAccess, 
  onClose 
}) => {
  return (
    <>
      {isAuthenticated && (
        <MobileNavLink 
          to="/dashboard" 
          icon={<Home className="w-5 h-5" />} 
          label="Dashboard" 
          onClick={onClose} 
        />
      )}

      {/* Employee Management - For Managers/HR/Admin */}
      {hasManagerialAccess && (
        <>
          <MobileNavLink 
            to="/people" 
            icon={<Users className="w-5 h-5" />} 
            label="People" 
            onClick={onClose} 
          />
          
          <MobileNavLink 
            to="/attendance" 
            icon={<UserCheck className="w-5 h-5" />} 
            label="Attendance" 
            onClick={onClose} 
          />
        </>
      )}

      {/* Schedule Management */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/schedule" 
          icon={<Calendar className="w-5 h-5" />} 
          label="Schedule" 
          onClick={onClose} 
        />
      )}

      {/* Leave Management */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/leave" 
          icon={<FileText className="w-5 h-5" />} 
          label="Leave" 
          onClick={onClose} 
        />
      )}

      {/* Salary - All users can see their salary */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/salary" 
          icon={<DollarSign className="w-5 h-5" />} 
          label="Salary" 
          onClick={onClose} 
        />
      )}

      {/* Payroll - For Managers/HR/Admin/Payroll */}
      {hasManagerialAccess && (
        <MobileNavLink 
          to="/payroll" 
          icon={<Calculator className="w-5 h-5" />} 
          label="Payroll" 
          onClick={onClose} 
        />
      )}

      {/* Employee Workflow - For employees */}
      {isEmployee && (
        <MobileNavLink 
          to="/employee-workflow" 
          icon={<ClipboardList className="w-5 h-5" />} 
          label="Workflow" 
          onClick={onClose} 
        />
      )}

      {/* Restaurant Schedule - For Managers */}
      {hasManagerialAccess && (
        <MobileNavLink 
          to="/restaurant-schedule" 
          icon={<Clock className="w-5 h-5" />} 
          label="Restaurant Schedule" 
          onClick={onClose} 
        />
      )}

      {/* Profile */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/profile" 
          icon={<User className="w-5 h-5" />} 
          label="Profile" 
          onClick={onClose} 
        />
      )}

      {/* Settings */}
      {isAuthenticated && (
        <MobileNavLink 
          to="/settings" 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          onClick={onClose} 
        />
      )}
    </>
  );
};

export default CommonSection;
