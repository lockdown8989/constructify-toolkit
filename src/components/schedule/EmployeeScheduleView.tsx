
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { usePublishedShifts } from '@/hooks/use-published-shifts';
import { useIsMobile } from '@/hooks/use-mobile';
import ScheduleList from './ScheduleList';
import ClaimableShiftCard from './components/ClaimableShiftCard';
import ShiftSwapTab from './ShiftSwapTab';
import AvailabilityManagement from './AvailabilityManagement';
import ModernCalendar from './calendar/ModernCalendar';
import { Schedule } from '@/hooks/use-schedules';

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

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`${isMobile ? 'w-full grid-cols-4' : ''} grid grid-cols-4`}>
          <TabsTrigger value="calendar" className={isMobile ? 'text-xs' : ''}>
            Calendar
          </TabsTrigger>
          <TabsTrigger value="my-shifts" className={isMobile ? 'text-xs' : ''}>
            My Shifts
          </TabsTrigger>
          <TabsTrigger value="available" className={isMobile ? 'text-xs' : ''}>
            Available
          </TabsTrigger>
          <TabsTrigger value="manage" className={isMobile ? 'text-xs' : ''}>
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <ModernCalendar
            schedules={schedules}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onScheduleClick={handleScheduleClick}
            isLoading={schedulesLoading}
          />
        </TabsContent>

        <TabsContent value="my-shifts" className="mt-4">
          <ScheduleList
            schedules={schedules}
            isLoading={schedulesLoading}
            onRefresh={refreshSchedules}
            showFilters={true}
          />
        </TabsContent>

        <TabsContent value="available" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Shifts</h2>
              <span className="text-sm text-gray-500">
                {publishedShifts.length} available
              </span>
            </div>
            
            {shiftsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : publishedShifts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No available shifts at the moment
              </div>
            ) : (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
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
          <div className="space-y-6">
            <AvailabilityManagement />
            <ShiftSwapTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeScheduleView;
