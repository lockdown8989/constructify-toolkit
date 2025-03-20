
import React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarHeaderProps {
  currentDate: Date;
  activeView: "calendar" | "list";
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onViewChange: (view: "calendar" | "list") => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  activeView,
  onPrevMonth,
  onNextMonth,
  onViewChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h2 className="text-xl font-bold">Leave Calendar</h2>
        <span className="text-sm text-muted-foreground">
          {format(currentDate, "MMMM yyyy")}
        </span>
      </div>
      <Tabs value={activeView} onValueChange={(value) => onViewChange(value as "calendar" | "list")} className="ml-auto mr-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <Grid className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <List className="h-4 w-4" />
            <span>List</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onPrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
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
