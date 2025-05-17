
import { Clock } from "lucide-react";
import MobileNavLink from "./MobileNavLink";
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";

interface TimeClocksSectionProps {
  onClose: () => void;
  isAuthenticated?: boolean;
  hasManagerialAccess?: boolean;
}

const TimeClocksSection = ({ onClose, isAuthenticated = true, hasManagerialAccess = false }: TimeClocksSectionProps) => {
  const { isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Use passed hasManagerialAccess if provided, otherwise fallback to local check
  const showManagerTimeClock = hasManagerialAccess || isManager || isAdmin;

  return (
    <>
      <MobileNavLink
        to="/time-clock"
        icon={Clock}
        label="Time Clock"
        onClick={() => {
          navigate('/time-clock');
          onClose();
        }}
      />
      
      {showManagerTimeClock && (
        <MobileNavLink
          to="/manager-time-clock"
          icon={Clock}
          label="⏰️IN AND OUT⏱️"
          onClick={() => {
            navigate('/manager-time-clock');
            onClose();
          }}
          className="time-clock-nav-button"
        />
      )}
    </>
  );
};

export default TimeClocksSection;
