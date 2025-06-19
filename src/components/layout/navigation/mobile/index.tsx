
import React from 'react';
import { useAuth } from '@/hooks/auth';
import MobileNavContent from './MobileNavContent';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { isAdmin, isHR, isManager, isEmployee, isPayroll, isAuthenticated } = useAuth();
  
  // Calculate managerial access properly - exclude payroll users
  const hasManagerialAccess = (isManager || isAdmin || isHR) && !isPayroll;

  console.log("MobileNav - Role debug:", {
    isAdmin,
    isHR, 
    isManager,
    isEmployee,
    isPayroll,
    hasManagerialAccess,
    isAuthenticated
  });

  return (
    <MobileNavContent 
      isOpen={isOpen}
      onClose={onClose}
      isAuthenticated={isAuthenticated}
      isEmployee={isEmployee}
      hasManagerialAccess={hasManagerialAccess}
      isPayroll={isPayroll}
    />
  );
};

export default MobileNav;
