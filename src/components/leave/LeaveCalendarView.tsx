
import React from "react";
import { useLeaveCalendar } from "@/hooks/leave/use-leave-requests";
import Calendar from "./calendar/components/Calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

const LeaveCalendarView: React.FC = () => {
  const { data: leaveEvents, isLoading } = useLeaveCalendar();

  return (
    <Card className="border rounded-xl shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center text-xl">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
          Leave Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Calendar />
      </CardContent>
    </Card>
  );
};

export default LeaveCalendarView;
