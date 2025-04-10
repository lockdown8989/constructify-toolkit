
import React, { useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up real-time listener for leave calendar changes
  useEffect(() => {
    const channel = supabase
      .channel('leave_calendar_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_calendar'
        },
        (payload) => {
          console.log('Leave calendar change detected:', payload);
          
          // Invalidate queries to refresh leave calendar data
          queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
          
          // Display notification based on event type
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New leave request",
              description: "A new leave request has been submitted.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Leave request updated",
              description: "A leave request has been updated.",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Leave request deleted",
              description: "A leave request has been deleted.",
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
  
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
