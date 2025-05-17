
import React from 'react';
import { 
  LayoutDashboard, FileText, User, Calendar, DollarSign
} from "lucide-react";
import MobileNavLink from "./MobileNavLink";
import MobileNavDivider from "./MobileNavDivider";

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
        to="/dashboard"
        icon={LayoutDashboard}
        label="🗃 Dashboard"
        onClick={onClose}
      />
      
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
      
      {isAuthenticated && (
        <>
          {isEmployee && (
            <>
              <MobileNavDivider />
              
              <MobileNavLink
                to="/employee-workflow"
                icon={Calendar}
                label="🗒 My Schedule"
                onClick={onClose}
              />
              
              <MobileNavLink
                to="/leave-management"
                icon={Calendar}
                label="📑 Leave Management"
                onClick={onClose}
              />
              
              <MobileNavLink
                to="/salary"
                icon={DollarSign}
                label="💰 Salary"
                onClick={onClose}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default CommonSection;
