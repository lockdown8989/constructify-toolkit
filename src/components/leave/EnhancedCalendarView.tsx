
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

// Import refactored components
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarFilters from "./calendar/CalendarFilters";
import CalendarLegend from "./calendar/CalendarLegend";
import CalendarGrid from "./calendar/CalendarGrid";
import LeaveListView from "./calendar/LeaveListView";
import { useCalendarState } from "@/hooks/leave/useCalendarState";

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
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
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
      </CardContent>
    </Card>
  );
};

export default EnhancedCalendarView;
