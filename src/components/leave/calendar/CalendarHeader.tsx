
import React from "react";
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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
      <div className="text-xl font-bold">
        Leave Calendar
      </div>
      <div className="flex space-x-2">
        {onViewChange && (
          <div className="flex border rounded-md mr-2">
            <Button
              variant={activeView === "calendar" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => onViewChange("calendar")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant={activeView === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => onViewChange("list")}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
        )}
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
  );
};

export default CalendarHeader;
