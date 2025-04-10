
import React from "react";
import EnhancedCalendarView from "@/components/leave/EnhancedCalendarView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const CalendarTab: React.FC = () => {
  return (
    <div className="max-w-full">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Team Leave Calendar</CardTitle>
          </div>
          <CardDescription>
            View and filter all team members' leave to help with resource planning and scheduling.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <EnhancedCalendarView />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarTab;
