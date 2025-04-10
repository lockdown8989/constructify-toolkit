
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

interface DesktopNavProps {
  isAuthenticated?: boolean;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ isAuthenticated: propIsAuthenticated }) => {
  const { isAuthenticated: contextIsAuthenticated } = useAuth();
  
  // Use the prop if provided, otherwise use the context value
  const isAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : contextIsAuthenticated;

  const activeClassName = "text-primary";
  const inactiveClassName = "hover:text-gray-500 transition-colors duration-200";

  return (
    <nav className="hidden lg:flex items-center space-x-6">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? activeClassName : inactiveClassName
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/employees"
        className={({ isActive }) =>
          isActive ? activeClassName : inactiveClassName
        }
      >
        Employees
      </NavLink>
      <NavLink
        to="/projects"
        className={({ isActive }) =>
          isActive ? activeClassName : inactiveClassName
        }
      >
        Projects
      </NavLink>
      <NavLink
        to="/payroll"
        className={({ isActive }) =>
          isActive ? activeClassName : inactiveClassName
        }
      >
        Payroll
      </NavLink>
      <NavLink
        to="/attendance"
        className={({ isActive }) =>
          isActive ? activeClassName : inactiveClassName
        }
      >
        Attendance
      </NavLink>
      {isAuthenticated && (
        <NavLink
          to="/leave"
          className={({ isActive }) =>
            isActive ? activeClassName : inactiveClassName
          }
        >
          Leave
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink
          to="/schedule"
          className={({ isActive }) =>
            isActive ? activeClassName : inactiveClassName
          }
        >
          Schedule
        </NavLink>
      )}
      <NavLink 
        to="/workflow" 
        className={({ isActive }) => 
          isActive ? activeClassName : inactiveClassName
        }
      >
        Workflow
      </NavLink>
    </nav>
  );
};

export default DesktopNav;
