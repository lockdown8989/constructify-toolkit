
import { Users, Calendar, Receipt, ClipboardCheck, Clock, BarChart3 } from "lucide-react";
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
        to="/restaurant-schedule"
        icon={Clock}
        label="🕐 Restaurant Schedule"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/people"
        icon={Users}
        label="👥 Team Members"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/schedule"
        icon={Calendar}
        label="📆 Schedule Calendar"
        onClick={onClose}
      />
    </>
  );
};

export default ManagerSection;
