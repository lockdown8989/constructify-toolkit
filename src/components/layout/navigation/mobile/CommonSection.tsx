
import React from 'react';
import { Bell, FileText, User, Calendar } from "lucide-react";
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
      <MobileNavLink
        to="/about"
        icon={FileText}
        label="About"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/contact"
        icon={User}
        label="Contact"
        onClick={onClose}
      />
      
      {isAuthenticated && isEmployee && (
        <MobileNavLink
          to="/employee-calendar"
          icon={Calendar}
          label="My Calendar"
          onClick={onClose}
        />
      )}
      
      {isAuthenticated && (
        <MobileNavLink
          to="/notifications"
          icon={Bell}
          label="Notifications"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default CommonSection;
