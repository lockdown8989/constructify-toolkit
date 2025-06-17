
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

  return (
    <>
      {/* Time Clock with IN/OUT buttons - Available for all authenticated users */}
      {isAuthenticated && (
        <MobileNavLink
          to="/time-clock"
          icon={Clock}
          label="⏰️IN AND OUT⏱️"
          onClick={() => {
            navigate('/time-clock');
            onClose();
          }}
          className="time-clock-nav-button"
        />
      )}
    </>
  );
};

export default TimeClocksSection;
