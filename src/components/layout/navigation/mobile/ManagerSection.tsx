
import { Users, Calendar, Receipt, ClipboardCheck, Clock, BarChart3, Settings } from "lucide-react";
import MobileNavLink from "./MobileNavLink";

interface ManagerSectionProps {
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const ManagerSection = ({ hasManagerialAccess, onClose }: ManagerSectionProps) => {
  console.log("🎯 ManagerSection render - hasManagerialAccess:", hasManagerialAccess);
  
  if (!hasManagerialAccess) {
    console.log("❌ No managerial access - not rendering manager section");
    return null;
  }
  
  console.log("✅ Rendering manager navigation section");
  
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
        label="⏰ IN AND OUT ⏰"
        onClick={() => {
          console.log("🚀 Navigating to manager time clock");
          onClose();
        }}
        className="time-clock-nav-button bg-blue-50 border-l-4 border-l-blue-500 font-semibold"
      />
    </>
  );
};

export default ManagerSection;
