
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { usePublishedShifts } from '@/hooks/use-published-shifts';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import ScheduleList from './ScheduleList';
import ClaimableShiftCard from './components/ClaimableShiftCard';
import ShiftSwapTab from './ShiftSwapTab';
import AvailabilityManagement from './AvailabilityManagement';
import ModernCalendar from './calendar/ModernCalendar';
import MobileScheduleCalendar from './mobile/MobileScheduleCalendar';
import MobileShiftList from './mobile/MobileShiftList';
import { Schedule } from '@/hooks/use-schedules';
import { useSearchParams } from 'react-router-dom';

const EmployeeScheduleView: React.FC = () => {
  const isMobile = useIsMobile();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const {
    currentDate,
    setCurrentDate,
    activeTab,
    setActiveTab,
    schedules,
    isLoading: schedulesLoading,
    refreshSchedules
  } = useEmployeeSchedule();

  const {
    publishedShifts,
    isLoading: shiftsLoading,
    claimShift,
    isClaimingShift
  } = usePublishedShifts();

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  // Support deep linking via ?tab=... (calendar | my-shifts | available | manage)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    const validTabs = new Set(['calendar', 'my-shifts', 'available', 'manage']);
    if (tab && validTabs.has(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, setActiveTab]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'p-2' : 'p-6'}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "grid grid-cols-4 w-full",
          isMobile ? "h-12 text-xs gap-0.5" : "h-10"
        )}>
          <TabsTrigger 
            value="calendar" 
            className={cn(
              "touch-target transition-all duration-200",
              isMobile ? "text-xs px-2 py-2" : ""
            )}
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="my-shifts" 
            className={cn(
              "touch-target transition-all duration-200",
              isMobile ? "text-xs px-2 py-2" : ""
            )}
          >
            My Shifts
          </TabsTrigger>
          <TabsTrigger 
            value="available" 
            className={cn(
              "touch-target transition-all duration-200",
              isMobile ? "text-xs px-2 py-2" : ""
            )}
          >
            Available
          </TabsTrigger>
          <TabsTrigger 
            value="manage" 
            className={cn(
              "touch-target transition-all duration-200",
              isMobile ? "text-xs px-2 py-2" : ""
            )}
          >
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          {isMobile ? (
            <MobileScheduleCalendar
              schedules={schedules}
              currentDate={currentDate}
              onDateChange={handleDateChange}
              onScheduleClick={handleScheduleClick}
              isLoading={schedulesLoading}
              onRefresh={refreshSchedules}
            />
          ) : (
            <ModernCalendar
              schedules={schedules}
              currentDate={currentDate}
              onDateChange={handleDateChange}
              onScheduleClick={handleScheduleClick}
              isLoading={schedulesLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="my-shifts" className="mt-4">
          {isMobile ? (
            <MobileShiftList
              schedules={schedules}
              isLoading={schedulesLoading}
              onRefresh={refreshSchedules}
              onScheduleClick={handleScheduleClick}
            />
          ) : (
            <ScheduleList
              schedules={schedules}
              isLoading={schedulesLoading}
              onRefresh={refreshSchedules}
              showFilters={true}
            />
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Shifts</h2>
              <span className={cn(
                "px-2 py-1 rounded-full text-sm font-medium",
                publishedShifts.length > 0 
                  ? "bg-green-100 text-green-800" 
                  : "bg-muted text-muted-foreground"
              )}>
                {publishedShifts.length} available
              </span>
            </div>
            
            {shiftsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading available shifts...</span>
                </div>
              </div>
            ) : publishedShifts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">
                  No available shifts at the moment
                </div>
                <p className="text-sm text-muted-foreground">
                  Check back later for new opportunities
                </p>
              </div>
            ) : (
              <div className={cn(
                "grid gap-4", 
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {publishedShifts.map((shift) => (
                  <ClaimableShiftCard
                    key={shift.id}
                    shift={shift}
                    onClaim={claimShift}
                    isClaimingShift={isClaimingShift}
                    canClaim={true}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <div className={cn("space-y-6", isMobile && "space-y-4")}>
            <AvailabilityManagement />
            <ShiftSwapTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeScheduleView;
