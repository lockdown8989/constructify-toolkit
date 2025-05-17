
import { Clock } from "lucide-react";
import MobileNavLink from "./MobileNavLink";

interface TimeClocksSectionProps {
  hasManagerialAccess: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
}

const TimeClocksSection = ({ hasManagerialAccess, isAuthenticated, onClose }: TimeClocksSectionProps) => {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="my-2">
      <h4 className="text-xs uppercase text-neutral-500 font-medium mb-1 px-6">Time Management</h4>
      
      <MobileNavLink
        to="/time-clock"
        icon={Clock}
        label="Time Clock"
        onClick={onClose}
      />
      
      {hasManagerialAccess && (
        <MobileNavLink
          to="/manager-time-clock"
          icon={Clock}
          label="⏰️IN AND OUT⏱️"
          onClick={onClose}
          className="font-medium text-emerald-700 bg-emerald-50"
        />
      )}
    </div>
  );
};

export default TimeClocksSection;
