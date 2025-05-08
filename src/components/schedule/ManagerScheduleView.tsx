
import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, Calendar, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmployeeScheduleTimeline from './components/EmployeeScheduleTimeline';
import ScheduleViewSelector from './components/ScheduleViewSelector';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import NewScheduleDialog from './components/NewScheduleDialog';

const ManagerScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewScheduleDialogOpen, setIsNewScheduleDialogOpen] = useState(false);
  const { data: employeeList = [], isLoading: isLoadingEmployees } = useEmployees({});
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedules();
  const { toast } = useToast();

  // Filter employees based on search query
  const filteredEmployees = employeeList.filter(employee => 
    employee.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Process schedules to assign them to correct employees
  const employeeSchedules = filteredEmployees.map(employee => {
    const employeeShifts = schedules.filter(schedule => 
      schedule.employee_id === employee.id && 
      (viewType === 'day' 
        ? isSameDay(new Date(schedule.start_time), currentDate)
        : true // For week/month view, we'll filter further in the timeline component
      )
    );
    
    return {
      ...employee,
      schedules: employeeShifts
    };
  });

  const handlePreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, viewType === 'day' ? 1 : viewType === 'week' ? 7 : 30));
  };

  const handleNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, viewType === 'day' ? 1 : viewType === 'week' ? 7 : 30));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handlePublish = () => {
    toast({
      title: "Schedules published!",
      description: "All employees will be notified about their schedules.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto bg-white overflow-hidden rounded-xl shadow-sm border">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b">
        <div className="flex items-center mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold">Schedule</h1>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search employees..."
              className="pl-9 border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-wrap justify-between items-center border-b">
        <div className="flex items-center mb-2 sm:mb-0">
          <Calendar className="h-5 w-5 mr-2 text-gray-600" />
          <span className="font-medium">{format(currentDate, 'MMMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <ScheduleViewSelector 
            viewType={viewType} 
            onViewChange={setViewType}
          />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsNewScheduleDialogOpen(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              New Schedule
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={handlePublish}
              className="flex items-center gap-1"
            >
              <Send className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between p-2 border-b bg-gray-50">
          <Button variant="ghost" size="sm" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <EmployeeScheduleTimeline 
          employees={employeeSchedules}
          currentDate={currentDate}
          viewType={viewType}
          isLoading={isLoadingEmployees || isLoadingSchedules}
        />
      </div>
      
      <NewScheduleDialog 
        isOpen={isNewScheduleDialogOpen}
        onClose={() => setIsNewScheduleDialogOpen(false)} 
        employees={employeeList}
      />
    </div>
  );
};

export default ManagerScheduleView;
