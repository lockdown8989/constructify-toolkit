
import { Home } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useTimeClock } from "@/hooks/time-clock";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileNavDivider from "./MobileNavDivider";
import TimeClocksSection from "./TimeClocksSection";
import WorkflowSection from "./WorkflowSection";
import ClockingControls from "./ClockingControls";
import ManagerSection from "./ManagerSection";
import CommonSection from "./CommonSection";
import MobileNavLink from "./MobileNavLink";

interface MobileNavContentProps {
  isAuthenticated: boolean;
  onClose: () => void;
  handleHomeClick: () => void;
}

const MobileNavContent = ({ isAuthenticated, onClose, handleHomeClick }: MobileNavContentProps) => {
  const { isAdmin, isHR, isManager } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  const isClockingEnabled = !hasManagerialAccess && isAuthenticated;
  
  return (
    <>
      <ClockingControls 
        isClockingEnabled={isClockingEnabled}
        status={status}
        handleClockIn={handleClockIn}
        handleClockOut={handleClockOut}
        handleBreakStart={handleBreakStart}
        handleBreakEnd={handleBreakEnd}
        onClose={onClose}
      />
      
      <ScrollArea className="h-[calc(100vh-80px)]">
        <nav className="grid gap-1 px-2 py-2">
          <div
            onClick={handleHomeClick}
            className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
          >
            <Home className="mr-3 h-5 w-5 text-neutral-600" />
            <span>Home</span>
          </div>
          
          {isAuthenticated && (
            <MobileNavLink
              to="/dashboard"
              icon={Home}
              label="Overview"
              onClick={onClose}
            />
          )}
          
          <CommonSection 
            isAuthenticated={isAuthenticated} 
            isEmployee={isAuthenticated && !hasManagerialAccess} 
            hasManagerialAccess={hasManagerialAccess} 
            onClose={onClose} 
          />
          
          {isAuthenticated && (
            <>
              <MobileNavDivider />
              
              <ManagerSection 
                hasManagerialAccess={hasManagerialAccess} 
                onClose={onClose} 
              />
              
              <TimeClocksSection 
                hasManagerialAccess={hasManagerialAccess} 
                isAuthenticated={isAuthenticated}
                onClose={onClose} 
              />
              
              <WorkflowSection 
                hasManagerialAccess={hasManagerialAccess} 
                onClose={onClose} 
              />
            </>
          )}
        </nav>
      </ScrollArea>
    </>
  );
};

export default MobileNavContent;
