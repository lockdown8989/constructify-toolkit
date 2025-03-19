
import React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  activeView?: "calendar" | "list";
  onViewChange?: (view: "calendar" | "list") => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  activeView = "calendar",
  onViewChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-2xl font-semibold leading-none tracking-tight">
        Leave Calendar
      </div>
      <div className="flex items-center space-x-4">
        {onViewChange && (
          <div className="flex space-x-1">
            <Button
              variant={activeView === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange("calendar")}
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant={activeView === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange("list")}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-4 font-medium">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
