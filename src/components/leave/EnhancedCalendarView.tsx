
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

// Import refactored components
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarFilters from "./calendar/CalendarFilters";
import CalendarLegend from "./calendar/CalendarLegend";
import CalendarGrid from "./calendar/CalendarGrid";
import LeaveListView from "./calendar/LeaveListView";
import { useCalendarState } from "@/hooks/leave/useCalendarState";
import { Skeleton } from "@/components/ui/skeleton";

const EnhancedCalendarView: React.FC = () => {
  const {
    currentDate,
    activeView,
    dateRange,
    searchTerm,
    leaves,
    filteredLeaves,
    isLoading,
    handlePrevMonth,
    handleNextMonth,
    setDateRange,
    setSearchTerm,
    setActiveView,
    getEmployeeName
  } = useCalendarState();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <CalendarHeader 
          currentDate={currentDate}
          activeView={activeView}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onViewChange={(view) => setActiveView(view)}
        />
        <CardDescription>
          Color-coded employee leave calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <CalendarFilters 
          dateRange={dateRange}
          searchTerm={searchTerm}
          onDateRangeChange={setDateRange}
          onSearchTermChange={setSearchTerm}
        />
        
        {/* Calendar Legend */}
        <CalendarLegend />
        
        <div className="mt-4 bg-white rounded-md border p-1">
          {activeView === "calendar" ? (
            <div className="mt-2">
              <CalendarGrid 
                currentDate={currentDate}
                leaves={leaves}
                getEmployeeName={getEmployeeName}
              />
            </div>
          ) : (
            <div className="mt-2">
              <LeaveListView 
                leaves={filteredLeaves}
                getEmployeeName={getEmployeeName}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCalendarView;
