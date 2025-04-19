
import React from 'react';
import { format } from 'date-fns';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import ShiftCard from './ShiftCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const EmployeeScheduleView: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    activeTab,
    setActiveTab,
    schedules,
    isLoading,
    refreshSchedules,
  } = useEmployeeSchedule();

  const filteredSchedules = schedules.filter(schedule => {
    switch (activeTab) {
      case 'my-shifts':
        return schedule.status === 'confirmed';
      case 'open-shifts':
        return schedule.status === 'pending' && !schedule.employee_id;
      case 'pending':
        return schedule.status === 'pending';
      case 'completed':
        return schedule.status === 'completed';
      default:
        return true;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe-area-inset-bottom">
      <div className="bg-cyan-500 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Schedule</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-cyan-400"
            onClick={refreshSchedules}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-cyan-100">
          <CalendarIcon className="h-5 w-5" />
          <span>{format(currentDate, 'dd MMMM yyyy')}</span>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={currentDate}
        onSelect={(date) => date && setCurrentDate(date)}
        className="rounded-none border-0"
        classNames={{
          day_today: "bg-cyan-600 text-white font-bold hover:bg-cyan-600",
          day_selected: "bg-cyan-500 text-white hover:bg-cyan-500 focus:bg-cyan-500",
          nav_button_previous: "hover:bg-cyan-50",
          nav_button_next: "hover:bg-cyan-50",
        }}
      />
      
      <Tabs defaultValue="my-shifts" onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-start rounded-none border-b bg-white p-0">
          {['my-shifts', 'open-shifts', 'pending', 'completed'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                "flex-1 rounded-none border-b-2 border-transparent px-3 py-3 text-sm capitalize",
                "data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-700"
              )}
            >
              {tab.replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        {['my-shifts', 'open-shifts', 'pending', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab} className="flex-1 p-4">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <ShiftCard key={schedule.id} schedule={schedule} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No {tab.replace('-', ' ')} found
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EmployeeScheduleView;
