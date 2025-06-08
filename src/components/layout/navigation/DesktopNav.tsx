
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
      <NavLink
        to="/overview"
        className={({ isActive }) =>
          `nav-link ${isActive ? "active" : ""}`
        }
      >
        Overview
      </NavLink>
      <NavLink
        to="/employee-schedule"
        className={({ isActive }) =>
          `nav-link ${isActive ? "active" : ""}`
        }
      >
        Employee
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
              `nav-link ${isActive ? "active" : ""}`
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
