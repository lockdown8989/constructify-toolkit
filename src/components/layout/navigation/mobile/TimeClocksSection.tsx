
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
  const navigate = useNavigate();

  const handleTimeClockClick = () => {
    if (hasManagerialAccess) {
      navigate('/manager-time-clock');
    } else {
      navigate('/time-clock');
    }
    onClose();
  };

  return (
    <>
      {/* Time Clock with IN/OUT buttons - Only for managers, not payroll users */}
      {isAuthenticated && hasManagerialAccess && (
        <MobileNavLink
          to="/manager-time-clock"
          icon={Clock}
          label="⏰️IN AND OUT⏱️"
          onClick={handleTimeClockClick}
          className="time-clock-nav-button"
        />
      )}
    </>
  );
};

export default TimeClocksSection;
