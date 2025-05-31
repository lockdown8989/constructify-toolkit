
import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth";
import { useTimeClock } from "@/hooks/time-clock";

import SidebarHeader from './sidebar/SidebarHeader';
import TimeClockControls from './sidebar/TimeClockControls';
import NavigationLinks from './sidebar/NavigationLinks';

interface DesktopSidebarProps {
  isAuthenticated: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isAuthenticated }) => {
  const { isAdmin, isHR, isManager } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  const isClockingEnabled = !hasManagerialAccess && isAuthenticated;
  
  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className={cn(
      "desktop-sidebar flex-col h-screen border-r transition-all duration-300", 
      isCollapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <SidebarHeader 
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />
      
      <div className="sidebar-content">
        <TimeClockControls
          isClockingEnabled={isClockingEnabled}
          isCollapsed={isCollapsed}
          status={status}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          onBreakStart={handleBreakStart}
          onBreakEnd={handleBreakEnd}
        />
        
        <NavigationLinks 
          isAuthenticated={isAuthenticated}
          isCollapsed={isCollapsed}
          hasManagerialAccess={hasManagerialAccess}
          currentPath={location.pathname}
        />
      </div>
    </div>
  );
};

export default DesktopSidebar;
