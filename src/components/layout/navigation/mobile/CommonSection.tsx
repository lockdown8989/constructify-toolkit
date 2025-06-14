
import React from "react";
import { Home, Calendar, FileText, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileNavLink from "./MobileNavLink";

interface CommonSectionProps {
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  isPayroll: boolean;
  onClose: () => void;
}

const CommonSection: React.FC<CommonSectionProps> = ({
  isAuthenticated,
  isEmployee,
  hasManagerialAccess,
  isPayroll,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    {
      to: "/dashboard",
      icon: Home,
      label: "Dashboard",
      visible: true,
    },
    {
      to: "/schedule",
      icon: Calendar,
      label: "Schedule",
      visible: true,
    },
    {
      to: "/leave",
      icon: FileText,
      label: "Leave",
      visible: true,
    },
    // "My Attendance" for employees only:
    {
      to: "/attendance",
      icon: Clock,
      label: "My Attendance",
      visible: isEmployee,
    },
    // Optionally: "My Schedule"
    // {
    //   to: "/my-schedule",
    //   icon: ClipboardList, // import if using
    //   label: "My Schedule",
    //   visible: isEmployee,
    // },
  ];

  return (
    <nav className="flex flex-col gap-0.5 pt-2">
      {navLinks
        .filter((link) => link.visible)
        .map((link) => (
          <MobileNavLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            onClick={onClose}
            // Optionally highlight current link:
            className={
              location.pathname === link.to
                ? "bg-gray-100 font-semibold"
                : ""
            }
          />
        ))}
    </nav>
  );
};

export default CommonSection;

