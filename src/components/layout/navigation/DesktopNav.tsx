
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ isAuthenticated }) => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;

  // Only show navigation links if the user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `nav-link ${isActive ? "active" : ""}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/restaurant-schedule"
        className={({ isActive }) =>
          `nav-link ${isActive ? "active" : ""}`
        }
      >
        Restaurant
      </NavLink>
      <NavLink
        to="/leave-management"
        className={({ isActive }) =>
          `nav-link ${isActive ? "active" : ""}`
        }
      >
        Leave
      </NavLink>
      {hasManagerAccess && (
        <NavLink
          to="/people"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          People
        </NavLink>
      )}
      {hasManagerAccess && (
        <NavLink
          to="/payroll"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Payroll
        </NavLink>
      )}
    </nav>
  );
};

export default DesktopNav;
