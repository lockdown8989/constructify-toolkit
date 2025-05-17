
import { Clock } from "lucide-react";
import MobileNavLink from "./MobileNavLink";
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";

interface TimeClocksSectionProps {
  onClose: () => void;
}

const TimeClocksSection = ({ onClose }: TimeClocksSectionProps) => {
  const { isManager, isAdmin } = useAuth();
  const hasManagerialAccess = isManager || isAdmin;
  const navigate = useNavigate();

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
      
      {hasManagerialAccess && (
        <MobileNavLink
          to="/manager-time-clock"
          icon={Clock}
          label="Manager Time Clock"
          onClick={() => {
            navigate('/manager-time-clock');
            onClose();
          }}
        />
      )}
    </>
  );
};

export default TimeClocksSection;
