
import React from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { useEmployees } from '../../hooks/use-employees';
import { useSchedules } from '../../hooks/use-schedules';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface WeeklyCalendarViewProps {
  startDate: Date;
  onDateChange: (date: Date) => void;
  currentDate?: Date; // Added optional currentDate prop
  schedules?: any[]; // Added optional schedules prop
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ 
  startDate, 
  onDateChange,
  currentDate, // New prop
  schedules: providedSchedules // New prop
}) => {
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedules();

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
                {days.map(day => {
                  const daySchedules = schedules.filter(s => {
                    const scheduleDate = parseISO(s.date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  });
                  
                  return (
                    <td key={day.toISOString()} className="px-6 py-4 whitespace-nowrap text-sm">
                      {daySchedules.map(schedule => (
                        <div
                          key={schedule.id}
                          className="mb-2 p-2 rounded-lg bg-blue-100 border border-blue-200"
                        >
                          <div className="font-medium">{schedule.title || 'Shift'}</div>
                          <div className="text-xs text-gray-500">
                            {schedule.start_time} - {schedule.end_time}
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
