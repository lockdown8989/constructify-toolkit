
import { Home, Calendar, FileText, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MobileNavLink from "./MobileNavLink";
import PayrollSection from "./PayrollSection";

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
  console.log("CommonSection - isPayroll:", isPayroll);
  
  if (!isAuthenticated) return null;

  return (
    <>
      <MobileNavLink 
        to="/dashboard" 
        icon={Home} 
        label="Dashboard" 
        onClick={onClose} 
      />

      {/* Show schedule link for non-managers and non-payroll users */}
      {!hasManagerialAccess && !isPayroll && (
        <MobileNavLink 
          to="/schedule" 
          icon={Calendar} 
          label="Schedule" 
          onClick={onClose} 
        />
      )}

      {/* Show leave management for all authenticated users */}
      <MobileNavLink 
        to="/leave-management" 
        icon={FileText} 
        label="Leave" 
        onClick={onClose} 
      />

      {/* Payroll Section - Only for payroll users */}
      {isPayroll && (
        <PayrollSection onClose={onClose} />
      )}

      <MobileNavLink 
        to="/profile" 
        icon={User} 
        label="Profile" 
        onClick={onClose} 
      />

      <MobileNavLink 
        to="/settings" 
        icon={Settings} 
        label="Settings" 
        onClick={onClose} 
      />
    </>
  );
};

export default CommonSection;
