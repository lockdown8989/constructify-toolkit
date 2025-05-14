
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNavLink from "./MobileNavLink";

interface TimeClocksSectionProps {
  hasManagerialAccess: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
}

const TimeClocksSection = ({ hasManagerialAccess, isAuthenticated, onClose }: TimeClocksSectionProps) => {
  if (!isAuthenticated) return null;
  
  return (
    <>
      {/* Add Employee Clock button for all users */}
      <MobileNavLink
        to="/time-clock"
        icon={Clock}
        label="Employee Clock"
        onClick={onClose}
      />
      
      {/* Manager Time Clock button for managers only */}
      {hasManagerialAccess && (
        <Link
          to="/manager-time-clock"
          onClick={onClose}
          className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target bg-gray-100"
        >
          <Clock className="mr-3 h-5 w-5 text-teal-600" />
          <span>⏰️IN ⏱️OUT</span>
        </Link>
      )}
    </>
  );
};

export default TimeClocksSection;
