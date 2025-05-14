
import React, { useState } from 'react';
import { format, addDays, isToday } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { Schedule } from '@/hooks/use-schedules';
import { Check, MessageSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types/restaurant-schedule';

interface ShiftProps {
  startTime: string;
  endTime: string;
  title: string;
  status?: string;
  colorAccent: string;
  isChecked?: boolean;
  onMessageClick?: () => void;
}

const Shift: React.FC<ShiftProps> = ({ 
  startTime, 
  endTime, 
  title, 
  status = 'confirmed',
  colorAccent, 
  isChecked = true,
  onMessageClick
}) => {
  const formattedStartTime = format(new Date(startTime), 'HH:mm');
  const formattedEndTime = format(new Date(endTime), 'HH:mm');
  
  return (
    <div 
      className={cn(
        "rounded-lg p-3 mb-2 relative bg-white border",
        "shift-card active-touch-state"
      )}
      style={{ borderLeftColor: colorAccent }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-sm">
          {formattedStartTime} - {formattedEndTime} {isChecked && <Check className="inline-block h-4 w-4 text-green-500 ml-1" />}
        </div>
        <button 
          onClick={onMessageClick}
          className="p-1 rounded-full"
        >
          <MessageSquare className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
};

const EmptyShift: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div 
    className="flex items-center justify-center h-20 border border-dashed border-gray-300 rounded-lg bg-gray-50"
    onClick={onClick}
  >
    <Plus className="h-6 w-6 text-gray-400" />
  </div>
);

const TravelIcon: React.FC = () => (
  <div className="bg-blue-400 rounded-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  </div>
);

interface MobileScheduleViewProps {
  schedules: Schedule[];
  employees: Employee[];
  onAddShift?: (employeeId: string, date: Date) => void;
  onShiftClick?: (shift: Schedule) => void;
}

const MobileScheduleView: React.FC<MobileScheduleViewProps> = ({
  schedules,
  employees,
  onAddShift,
  onShiftClick
}) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDays, setViewDays] = useState(2); // Number of days to show

  // Create display days
  const displayDays = Array.from({ length: viewDays }).map((_, index) => 
    addDays(currentDate, index)
  );
  
  // Get role colors
  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'Waiting Staff': '#FCA5A5', // Light Red
      'Chef': '#7DD3FC', // Light Blue
      'Duty Manager': '#BEF264', // Light Green
      'Front of house': '#FDBA74', // Light Orange
      'Marketing': '#C4B5FD', // Light Purple
      'default': '#E5E7EB' // Light Gray
    };
    
    // Find the closest match for roles that might contain these keywords
    for (const [key, value] of Object.entries(roleColors)) {
      if (role.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return roleColors.default;
  };

  // Navigate to previous/next day
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, -viewDays));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, viewDays));
  };

  // Get shifts for an employee on a specific day
  const getEmployeeShifts = (employeeId: string, date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return (
        schedule.employee_id === employeeId &&
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Extract role from title
  const getRoleFromTitle = (title: string) => {
    const titleParts = title.split(' - ');
    return titleParts.length > 1 ? titleParts[1] : title;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Day Navigation */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
        <Button variant="ghost" size="sm" onClick={goToPreviousDay} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex space-x-4">
          {displayDays.map((day, index) => (
            <div key={index} className={cn(
              "text-center",
              isToday(day) && "text-blue-600 font-semibold"
            )}>
              <div className="text-xs text-gray-500 uppercase">{format(day, 'EEE')}</div>
              <div className="font-semibold">{format(day, 'd MMM')}</div>
            </div>
          ))}
        </div>
        
        <Button variant="ghost" size="sm" onClick={goToNextDay} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto momentum-scroll">
        <div className="min-w-[600px]">
          {/* Employees and shifts */}
          <div className="divide-y divide-gray-200">
            {/* Current user row */}
            <div className="flex">
              <div className="w-[120px] p-3 bg-gray-50 flex flex-col justify-center items-center text-center border-r border-gray-200">
                <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium mb-1">
                  You
                </div>
              </div>
              
              {/* Days columns */}
              <div className="flex flex-grow divide-x divide-gray-200">
                {displayDays.map((day, dayIndex) => {
                  const currentUserShifts = user ? getEmployeeShifts(user.id, day) : [];
                  return (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "flex-1 p-2",
                        isToday(day) && "bg-blue-50/30"
                      )}
                    >
                      {currentUserShifts.length > 0 ? (
                        currentUserShifts.map(shift => {
                          const role = getRoleFromTitle(shift.title || '');
                          return (
                            <Shift 
                              key={shift.id}
                              startTime={shift.start_time}
                              endTime={shift.end_time}
                              title={role}
                              colorAccent={getRoleColor(role)}
                              onMessageClick={() => onShiftClick && onShiftClick(shift)}
                            />
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center h-20 text-sm text-gray-500">
                          No shifts
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Employee rows */}
            {employees.map(employee => {
              const initials = employee.name.split(' ').map(n => n[0]).join('');
              
              return (
                <div key={employee.id} className="flex">
                  <div className="w-[120px] p-3 bg-gray-50 flex flex-col justify-center items-center text-center border-r border-gray-200">
                    <Avatar className="h-8 w-8 mb-1">
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-sm">{employee.name}</div>
                    {employee.role && (
                      <div className="text-xs text-gray-500 truncate max-w-[110px]">
                        {employee.role}
                      </div>
                    )}
                  </div>
                  
                  {/* Days columns */}
                  <div className="flex flex-grow divide-x divide-gray-200">
                    {displayDays.map((day, dayIndex) => {
                      const employeeShifts = getEmployeeShifts(employee.id, day);
                      const isDayToday = isToday(day);
                      
                      return (
                        <div 
                          key={dayIndex} 
                          className={cn(
                            "flex-1 p-2",
                            isDayToday && "bg-blue-50/30"
                          )}
                        >
                          {employeeShifts.length > 0 ? (
                            employeeShifts.map(shift => {
                              const role = getRoleFromTitle(shift.title || '');
                              return (
                                <Shift 
                                  key={shift.id}
                                  startTime={shift.start_time}
                                  endTime={shift.end_time}
                                  title={role}
                                  colorAccent={getRoleColor(role)}
                                  onMessageClick={() => onShiftClick && onShiftClick(shift)}
                                />
                              );
                            })
                          ) : dayIndex === 1 && employee.name === "Courtney Henry" ? (
                            <div className="flex items-center justify-center h-20">
                              <TravelIcon />
                            </div>
                          ) : (
                            <EmptyShift 
                              onClick={() => onAddShift && onAddShift(employee.id, day)} 
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="border-t border-gray-200 p-3 flex justify-between items-center bg-gray-50 text-sm text-gray-500">
        <div>Last updated: {format(new Date(), 'MMM d, h:mm a')}</div>
        <div>{employees.length + 1} employees</div>
      </div>
    </div>
  );
};

export default MobileScheduleView;
