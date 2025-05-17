
import { Users, Calendar, Receipt, ClipboardCheck } from "lucide-react";
import MobileNavLink from "./MobileNavLink";

interface ManagerSectionProps {
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const ManagerSection = ({ hasManagerialAccess, onClose }: ManagerSectionProps) => {
  if (!hasManagerialAccess) return null;
  
  return (
    <>
      <MobileNavLink
        to="/attendance"
        icon={ClipboardCheck}
        label="📊 Attendance"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/people"
        icon={Users}
        label="📍 Team Members"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/shift-calendar"
        icon={Calendar}
        label="📆 Employee Schedule"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/payroll"
        icon={Receipt}
        label="📝 Payroll"
        onClick={onClose}
      />
    </>
  );
};

export default ManagerSection;
