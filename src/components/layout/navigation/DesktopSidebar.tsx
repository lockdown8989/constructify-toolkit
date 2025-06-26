
import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTimeClock } from "@/hooks/time-clock";

import SidebarHeader from './sidebar/SidebarHeader';
import TimeClockControls from './sidebar/TimeClockControls';
import { NavigationLinks } from './sidebar/NavigationLinks';

interface DesktopSidebarProps {
  isAuthenticated: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isAuthenticated }) => {
  const { isAdmin, isHR, isManager, isPayroll, isEmployee } = useAuth();
  
  // FIXED: Managers should have managerial access
  const hasManagerialAccess = (isManager || isAdmin || isHR) && !isPayroll;
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  
  // Only regular employees (not managers or payroll users) get clocking controls
  const isClockingEnabled = isEmployee && !hasManagerialAccess && !isPayroll && isAuthenticated;
  
  console.log("🖥️ DesktopSidebar - Role state:", {
    isManager,
    isAdmin,
    isHR,
    isPayroll,
    isEmployee,
    hasManagerialAccess,
    isClockingEnabled
  });
  
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
        
        <NavigationLinks />
      </div>
    </div>
  );
};

export default DesktopSidebar;
