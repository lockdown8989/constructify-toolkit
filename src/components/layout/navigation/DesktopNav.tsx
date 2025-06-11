
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ isAuthenticated }) => {
  const { isAdmin, isManager, isHR, isPayroll } = useAuth();
  const hasManagerAccess = (isAdmin || isManager || isHR) && !isPayroll;

  // Debug log to check payroll role in desktop nav
  console.log("DesktopNav - isPayroll:", isPayroll);
  console.log("DesktopNav - isAuthenticated:", isAuthenticated);
  console.log("DesktopNav - hasManagerAccess:", hasManagerAccess);

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
      
      {/* Restaurant Schedule - Only for managers */}
      {hasManagerAccess && (
        <NavLink
          to="/restaurant-schedule"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Restaurant Schedule
        </NavLink>
      )}
      
      <NavLink
        to="/schedule"
        className={({ isActive }) =>
          `nav-link ${isActive ? "active" : ""}`
        }
      >
        Schedule
      </NavLink>
      
      <NavLink
        to="/leave-management"
        className={({ isActive }) =>
          `nav-link ${isActive ? "active" : ""}`
        }
      >
        Leave
      </NavLink>
      
      {/* Manager Time Clock with IN/OUT - Only for managers */}
      {hasManagerAccess && (
        <NavLink
          to="/manager-time-clock"
          className={({ isActive }) =>
            `nav-link time-clock-nav-button ${isActive ? "active" : ""}`
          }
        >
          IN AND OUT
        </NavLink>
      )}
      
      {/* Attendance - Only for managers */}
      {hasManagerAccess && (
        <NavLink
          to="/attendance"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Attendance
        </NavLink>
      )}
      
      {/* Team Members (People) - Only for managers */}
      {hasManagerAccess && (
        <NavLink
          to="/people"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Team Members
        </NavLink>
      )}
      
      {/* Payroll button only for payroll users */}
      {isPayroll && (
        <>
          <NavLink
            to="/payroll"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Payroll
          </NavLink>
          <NavLink
            to="/salary"
            className={({ isActive }) =>
              `nav-link salary-nav-button ${isActive ? "active" : ""}`
            }
          >
            Salary
          </NavLink>
          <NavLink
            to="/payslips"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Payslips
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default DesktopNav;
