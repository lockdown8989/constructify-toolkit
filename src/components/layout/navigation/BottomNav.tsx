
import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Calendar, Briefcase, Clock, Users, PieChart, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/auth";

interface BottomNavProps {
  isAuthenticated: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ isAuthenticated }) => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bottom-nav z-50">
      <NavLink to="/dashboard" className="bottom-nav-item">
        {({ isActive }) => (
          <>
            <LayoutDashboard className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
            <div className={`text-xs mt-0.5 ${isActive ? "text-primary font-medium" : ""}`}>
              Dashboard
            </div>
          </>
        )}
      </NavLink>
      
      <NavLink to="/overview" className="bottom-nav-item">
        {({ isActive }) => (
          <>
            <PieChart className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
            <div className={`text-xs mt-0.5 ${isActive ? "text-primary font-medium" : ""}`}>
              Overview
            </div>
          </>
        )}
      </NavLink>
      
      <NavLink to="/attendance" className="bottom-nav-item">
        {({ isActive }) => (
          <>
            <UserCheck className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
            <div className={`text-xs mt-0.5 ${isActive ? "text-primary font-medium" : ""}`}>
              Attendance
            </div>
          </>
        )}
      </NavLink>
      
      {hasManagerAccess && (
        <NavLink to="/people" className="bottom-nav-item">
          {({ isActive }) => (
            <>
              <Users className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <div className={`text-xs mt-0.5 ${isActive ? "text-primary font-medium" : ""}`}>
                People
              </div>
            </>
          )}
        </NavLink>
      )}
      
      <NavLink to="/time-clock" className="bottom-nav-item">
        {({ isActive }) => (
          <>
            <Clock className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
            <div className={`text-xs mt-0.5 ${isActive ? "text-primary font-medium" : ""}`}>
              Time
            </div>
          </>
        )}
      </NavLink>
      
      <NavLink to="/leave-management" className="bottom-nav-item">
        {({ isActive }) => (
          <>
            <Briefcase className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
            <div className={`text-xs mt-0.5 ${isActive ? "text-primary font-medium" : ""}`}>
              Leave
            </div>
          </>
        )}
      </NavLink>
    </div>
  );
};

export default BottomNav;
