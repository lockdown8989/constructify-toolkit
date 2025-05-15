
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployeeCalendar } from '@/hooks/use-employee-calendar';
import CalendarHeader from '@/components/employee-calendar/CalendarHeader';
import CalendarNavigation from '@/components/employee-calendar/CalendarNavigation';
import WeekHeader from '@/components/employee-calendar/WeekHeader';
import TimeGrid from '@/components/employee-calendar/TimeGrid';

const EmployeeCalendar: React.FC = () => {
  const isMobile = useIsMobile();
  
  const {
    currentDate,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    events,
    weekDays,
    timeSlots,
    handlePrevious,
    handleNext,
    handleToday,
    handleAddEvent,
    getEventsForDay,
    formatEventTime
  } = useEmployeeCalendar();

  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container py-6'}`}>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-w-6xl mx-auto">
        {/* Calendar Header */}
        <CalendarHeader 
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddEvent={handleAddEvent}
        />
        
        {/* Calendar Navigation */}
        <CalendarNavigation 
          currentDate={currentDate}
          viewMode={viewMode}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handleToday={handleToday}
          weekDays={weekDays}
        />
        
        {/* Calendar Grid */}
        <div className={`overflow-auto ${isMobile ? 'momentum-scroll' : ''}`} style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          <div className="min-width-fit-content">
            {/* Day Headers for Week View */}
            {viewMode === 'week' && (
              <WeekHeader weekDays={weekDays} />
            )}
            
            {/* Time Grid */}
            <TimeGrid 
              events={events}
              currentDate={currentDate}
              viewMode={viewMode}
              timeSlots={timeSlots}
              weekDays={weekDays}
              getEventsForDay={getEventsForDay}
              formatEventTime={formatEventTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCalendar;
