
import React from 'react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getColorByDepartment } from '@/utils/color-utils';
import { Employee } from '@/types/employee';
import { Schedule } from '@/hooks/use-schedules';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmployeeWithSchedules extends Employee {
  schedules: Schedule[];
}

interface EmployeeScheduleTimelineProps {
  employees: EmployeeWithSchedules[];
  currentDate: Date;
  viewType: 'day' | 'week' | 'month';
  isLoading: boolean;
}

const EmployeeScheduleTimeline: React.FC<EmployeeScheduleTimelineProps> = ({
  employees,
  currentDate,
  viewType,
  isLoading
}) => {
  // Generate hour markers for timeline (8 AM to 8 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  
  // Calculate position and width for schedule blocks
  const calculateSchedulePosition = (schedule: Schedule) => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    
    const startPosition = (startHour - 8) / 12 * 100; // 8 AM is 0%, 8 PM is 100%
    const width = (endHour - startHour) / 12 * 100;
    
    return { startPosition, width };
  };
  
  // Get position text for display
  const getScheduleTimeText = (schedule: Schedule) => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    return `${format(startTime, 'h a')} - ${format(endTime, 'h a')}`;
  };
  
  // Generate skeleton loading UI
  if (isLoading) {
    return (
      <div className="relative">
        <div className="grid grid-cols-13 border-b py-2">
          {hours.map((hour) => (
            <div key={hour} className="text-center text-xs text-gray-500">
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
          ))}
        </div>
        
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-center p-2 border-b">
            <div className="w-48 flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex-1 relative h-16">
              <Skeleton className="absolute top-2 left-1/4 h-12 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative min-w-[800px]">
      {/* Hours header */}
      <div className="grid grid-cols-[200px_minmax(600px,1fr)] border-b">
        <div className="p-2 font-medium">Employee</div>
        <div className="grid grid-cols-12 relative">
          {hours.map((hour) => (
            <div 
              key={hour} 
              className="text-center text-xs text-gray-500 py-2 relative"
              style={{ gridColumn: hour - 7 }}
            >
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              <div className="absolute h-full w-px bg-gray-100 left-0 top-0"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Employee rows */}
      {employees.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No employees found. Try adjusting your search.
        </div>
      ) : (
        employees.map((employee) => (
          <div key={employee.id} className="grid grid-cols-[200px_minmax(600px,1fr)] border-b hover:bg-gray-50">
            {/* Employee info column */}
            <div className="p-3 flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback>{employee.name?.[0]}</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium">{employee.name}</div>
                <div className="text-xs text-gray-500">Hours: 40</div>
              </div>
            </div>
            
            {/* Schedule timeline column */}
            <div className="relative h-16">
              {/* Vertical hour dividers */}
              {hours.map((hour) => (
                <div 
                  key={hour} 
                  className="absolute h-full w-px bg-gray-100" 
                  style={{ left: `${(hour - 8) / 12 * 100}%` }}
                ></div>
              ))}
              
              {/* Schedule blocks */}
              {employee.schedules.map((schedule) => {
                const { startPosition, width } = calculateSchedulePosition(schedule);
                const department = schedule.title || employee.department || 'General';
                const colorClass = getColorByDepartment(department);
                
                return (
                  <div
                    key={schedule.id}
                    className={`absolute h-12 rounded-md p-1 top-2 ${colorClass} border-l-4 shadow-sm`}
                    style={{
                      left: `${startPosition}%`,
                      width: `${width}%`,
                      borderLeftColor: colorClass.includes('blue') ? 'rgb(59, 130, 246)' : 
                                      colorClass.includes('green') ? 'rgb(34, 197, 94)' :
                                      colorClass.includes('red') ? 'rgb(239, 68, 68)' : 
                                      colorClass.includes('yellow') ? 'rgb(234, 179, 8)' : 
                                      colorClass.includes('pink') ? 'rgb(236, 72, 153)' : 'rgb(79, 70, 229)'
                    }}
                  >
                    <div className="text-xs font-medium truncate">
                      {getScheduleTimeText(schedule)}
                    </div>
                    <div className="text-xs truncate">
                      {department}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeScheduleTimeline;
