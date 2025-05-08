
import React from "react";
import { useLeaveCalendar } from "@/hooks/leave/use-leave-requests";
import Calendar from "./calendar/components/Calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const LeaveCalendarView: React.FC = () => {
  const { data: leaveEvents, isLoading, refetch } = useLeaveCalendar();
  const isMobile = useIsMobile();
  
  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card className="border rounded-xl shadow-sm">
      <CardHeader className={`${isMobile ? 'p-3' : 'p-4'} flex flex-row items-center justify-between border-b`}>
        <CardTitle className="flex items-center text-lg">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
          Leave Calendar
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span className={isMobile ? 'hidden' : ''}>Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
        <div className="rounded-md">
          <Calendar />
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveCalendarView;
