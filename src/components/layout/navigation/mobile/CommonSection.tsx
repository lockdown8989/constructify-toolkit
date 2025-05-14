
import { FileText, User, Calendar, DollarSign } from "lucide-react";
import MobileNavLink from "./MobileNavLink";

interface CommonSectionProps {
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const CommonSection = ({ isAuthenticated, isEmployee, hasManagerialAccess, onClose }: CommonSectionProps) => {
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
      
      {isAuthenticated && (
        <>
          <MobileNavLink
            to="/leave-management"
            icon={Calendar}
            label="Leave & Schedule"
            onClick={onClose}
          />
          
          {(isEmployee || hasManagerialAccess) && (
            <MobileNavLink
              to="/salary"
              icon={DollarSign}
              label="Salary"
              onClick={onClose}
            />
          )}
        </>
      )}
    </>
  );
};

export default CommonSection;
