
import React, { useState } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { Info } from "lucide-react";
import { useLeaveCalendar } from "@/hooks/leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

// Import our new components
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarLegend from "./calendar/CalendarLegend";
import CalendarGrid from "./calendar/CalendarGrid";
import { getTypeColor, getStatusColor } from "./calendar/utils";

const LeaveCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calculate the first and last day of the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const firstDayOfMonth = format(monthStart, 'yyyy-MM-dd');
  const lastDayOfMonth = format(monthEnd, 'yyyy-MM-dd');
  
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar(firstDayOfMonth, lastDayOfMonth);
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  if (isLoadingLeaves || isLoadingEmployees) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <CardDescription>
          Color-coded employee leave calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <CalendarLegend />
        
        <CalendarGrid 
          currentDate={currentDate} 
          leaves={leaves} 
          getEmployeeName={getEmployeeName}
          getTypeColor={getTypeColor}
          getStatusColor={getStatusColor}
        />
      </CardContent>
    </Card>
  );
};

export default LeaveCalendarView;
