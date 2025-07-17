
import React from "react";
import ModernLeaveCalendar from "@/components/leave/ModernLeaveCalendar";
import { useIsMobile } from "@/hooks/use-mobile";

const CalendarTab: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? 'px-4' : ''}>
      <ModernLeaveCalendar />
    </div>
  );
};

export default CalendarTab;
