
import React, { useState, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { useEmployees } from '../../hooks/use-employees';
import { useSchedules } from '../../hooks/use-schedules';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface WeeklyCalendarViewProps {
  startDate: Date;
  onDateChange: (date: Date) => void;
  currentDate?: Date; 
  schedules?: any[]; 
  onShiftDrop?: (shiftId: string) => void;
  highlightedShiftId?: string | null;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ 
  startDate, 
  onDateChange,
  currentDate,
  schedules: providedSchedules,
  onShiftDrop,
  highlightedShiftId
}) => {
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedules();
  const { user } = useAuth();
  
  // Track which cells can accept drops
  const [dropTargets, setDropTargets] = useState<Record<string, boolean>>({});
  
  // Use provided schedules if available, otherwise use fetched schedules
  const schedulesToDisplay = providedSchedules || schedules;

  // Generate an array for the 7 days of the week
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Group schedules by employee
  const schedulesByEmployee = employees.reduce((acc, employee) => {
    acc[employee.id] = {
      employee,
      schedules: schedulesToDisplay.filter(schedule => schedule.employee_id === employee.id),
    };
    return acc;
  }, {} as Record<string, { employee: any; schedules: any[] }>);
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, dayIndex: number, employeeId: string) => {
    e.preventDefault();
    setDropTargets(prev => ({ 
      ...prev,
      [`${employeeId}-${dayIndex}`]: true 
    }));
  };
  
  // Handle drag leave
  const handleDragLeave = (employeeId: string, dayIndex: number) => {
    setDropTargets(prev => ({ 
      ...prev,
      [`${employeeId}-${dayIndex}`]: false 
    }));
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, day: Date, employeeId: string) => {
    e.preventDefault();
    
    try {
      const shiftData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (shiftData && shiftData.id && onShiftDrop) {
        console.log(`Dropped shift ${shiftData.id} on employee ${employeeId} for date ${format(day, 'yyyy-MM-dd')}`);
        onShiftDrop(shiftData.id);
      }
    } catch (error) {
      console.error('Error parsing shift data:', error);
    }
    
    // Clear drop targets
    setDropTargets({});
  };
  
  // Handle making a schedule draggable
  const handleDragStart = (e: React.DragEvent, schedule: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: schedule.id,
      title: schedule.title,
      start_time: schedule.start_time,
      end_time: schedule.end_time
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Navigate to previous/next week
  const navigateToPreviousWeek = () => {
    onDateChange(addDays(startDate, -7));
  };

  const navigateToNextWeek = () => {
    onDateChange(addDays(startDate, 7));
  };

  if (isLoadingEmployees || isLoadingSchedules) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with navigation */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold">Weekly Schedule</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={navigateToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 py-1">
            {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={navigateToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10 w-60">
                Employee
              </th>
              {days.map(day => (
                <th key={day.toISOString()} className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                  {format(day, 'EEEE')}
                  <div className="font-normal mt-1">{format(day, 'MMM d')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.values(schedulesByEmployee).map(({ employee, schedules }) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 w-60">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.job_title || 'Employee'}</div>
                    </div>
                  </div>
                </td>
                {days.map((day, dayIndex) => {
                  const daySchedules = schedules.filter(s => {
                    const scheduleDate = parseISO(s.date || s.start_time);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  });
                  
                  const dropKey = `${employee.id}-${dayIndex}`;
                  const isDropTarget = dropTargets[dropKey];
                  const isCurrentUser = user && employee.user_id === user.id;
                  
                  return (
                    <td 
                      key={day.toISOString()} 
                      className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm relative min-h-[100px]",
                        isDropTarget ? "bg-blue-50" : "",
                        isCurrentUser ? "bg-blue-50/20" : ""
                      )}
                      onDragOver={(e) => handleDragOver(e, dayIndex, employee.id)}
                      onDragLeave={() => handleDragLeave(employee.id, dayIndex)}
                      onDrop={(e) => handleDrop(e, day, employee.id)}
                    >
                      {daySchedules.map(schedule => (
                        <div
                          key={schedule.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, schedule)}
                          className={cn(
                            "mb-2 p-2 rounded-lg border cursor-move",
                            highlightedShiftId === schedule.id
                              ? "bg-green-100 border-green-300 animate-pulse"
                              : "bg-blue-100 border-blue-200",
                            isCurrentUser ? "border-blue-400" : ""
                          )}
                        >
                          <div className="font-medium">{schedule.title || 'Shift'}</div>
                          <div className="text-xs text-gray-500">
                            {schedule.start_time && format(new Date(schedule.start_time), 'p')} - 
                            {schedule.end_time && format(new Date(schedule.end_time), 'p')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {employee.department || 'General'}
                          </div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
