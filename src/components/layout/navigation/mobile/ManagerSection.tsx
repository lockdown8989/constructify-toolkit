
import { Users, Calendar, Receipt, ClipboardCheck, Clock, BarChart3, Settings } from "lucide-react";
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
        to="/people"
        icon={Users}
        label="👥 Team Members"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/restaurant-schedule"
        icon={Clock}
        label="🕐 Restaurant Schedule"
        onClick={onClose}
      />
      
      <MobileNavLink
        to="/schedule"
        icon={Calendar}
        label="📆 Schedule Calendar"
        onClick={onClose}
      />

      <MobileNavLink
        to="/shift-calendar"
        icon={Calendar}
        label="📅 Shift Calendar"
        onClick={onClose}
      />

      <MobileNavLink
        to="/shift-patterns"
        icon={Settings}
        label="⚙️ Shift Patterns"
        onClick={onClose}
      />

      <MobileNavLink
        to="/manager-time-clock"
        icon={Clock}
        label="🕒 Manager Time Clock"
        onClick={onClose}
      />
    </>
  );
};

export default ManagerSection;
