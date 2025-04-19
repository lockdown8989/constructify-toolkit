
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import ScheduleHeader from '@/components/schedule/employee-view/ScheduleHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftCard from '@/components/schedule/employee-view/ShiftCard';
import { addMonths, subMonths } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const EmployeeWorkflow = () => {
  const { user } = useAuth();
  const { 
    currentDate, 
    setCurrentDate,
    schedules,
    isLoading,
  } = useEmployeeSchedule();

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Employee Schedule</h1>
        <p>Please sign in to access your schedule.</p>
      </div>
    );
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ScheduleHeader 
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
      
      <Tabs defaultValue="my-shifts" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-white px-4 h-12">
          <TabsTrigger 
            value="my-shifts"
            className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#33C3F0]"
          >
            My Shifts
          </TabsTrigger>
          <TabsTrigger 
            value="open-shifts"
            className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#33C3F0]"
          >
            Open Shifts
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#33C3F0]"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#33C3F0]"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-8.5rem)]">
          <TabsContent value="my-shifts" className="p-4">
            {schedules
              .filter(s => s.status === 'confirmed')
              .map(shift => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
          </TabsContent>

          <TabsContent value="open-shifts" className="p-4">
            {schedules
              .filter(s => s.status === 'open')
              .map(shift => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
          </TabsContent>

          <TabsContent value="pending" className="p-4">
            {schedules
              .filter(s => s.status === 'pending')
              .map(shift => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
          </TabsContent>

          <TabsContent value="completed" className="p-4">
            {schedules
              .filter(s => s.status === 'completed')
              .map(shift => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default EmployeeWorkflow;
