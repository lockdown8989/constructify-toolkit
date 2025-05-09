
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Filter, Printer, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type Schedule } from '@/hooks/use-schedules';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useShiftManagement } from '@/hooks/use-shift-management';
import { useToast } from '@/hooks/use-toast';

interface ScheduleGridViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
}

const ScheduleGridView: React.FC<ScheduleGridViewProps> = ({
  currentDate,
  onDateChange,
  schedules
}) => {
  const isMobile = useIsMobile();
  const { isManager, user } = useAuth();
  const { toast } = useToast();
  const { 
    shiftsByDepartment, 
    toggleDepartment,
    getRoleColorClass,
    formatShiftTime
  } = useShiftManagement(schedules);
  
  console.log("Current schedules in grid view:", schedules);
  console.log("Shifts by department:", shiftsByDepartment);
  
  // Generate the days for the week view
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const day = addDays(startOfCurrentWeek, index);
    const isCurrentDay = isToday(day);
    
    return { 
      date: day, 
      dayName: format(day, 'EEE'),
      dayNumber: format(day, 'd'),
      isToday: isCurrentDay,
      dateStr: format(day, 'yyyy-MM-dd'),
      fullDate: format(day, 'EEE dd')
    };
  });

  const handlePrevWeek = () => {
    onDateChange(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    onDateChange(addDays(currentDate, 7));
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const handleThisWeekClick = () => {
    onDateChange(new Date()); // This will reset to current week
  };

  const handlePrintClick = () => {
    window.print();
  };

  const getDayNotes = (dayStr: string) => {
    // This would fetch actual day notes from a backend in a real app
    const notes: Record<string, string[]> = {
      'Mon 21': ['Cocktail party'],
      'Tue 22': ['Michelin review'],
      'Thu 24': ['Inspection!']
    };
    
    return notes[dayStr] || [];
  };

  const getEmployeeStatusMarker = (employeeId: string, dateStr: string) => {
    // Mock data for demonstration - would come from backend in real app
    const statusMarkers: Record<string, Record<string, {type: string, text: string}>> = {
      'employee-1': {
        '2025-05-10': { type: 'holiday', text: 'Holiday\n25 Sep' },
      },
      'employee-3': {
        '2025-05-13': { type: 'sick', text: 'Sick\n25 Sep' },
      }
    };
    
    return statusMarkers[employeeId]?.[dateStr];
  };

  // Show a toast when there's no data
  useEffect(() => {
    if (schedules.length === 0) {
      toast({
        title: "No schedule data",
        description: "There are currently no shifts scheduled. Data will appear here when shifts are assigned.",
      });
    }
  }, [schedules, toast]);

  return (
    <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
      {/* Header with navigation and controls */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevWeek}
            className="text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextWeek}
            className="text-gray-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="secondary" 
            className="ml-2"
            onClick={handleTodayClick}
          >
            Today
          </Button>
          <Button 
            variant="ghost"
            onClick={handleThisWeekClick}
          >
            This Week
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {isManager && (
            <>
              <Button variant="outline" size="sm" className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span className={cn(isMobile ? "hidden" : "")}>Add Group</span>
              </Button>
              
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                <span className={cn(isMobile ? "hidden" : "")}>Filter</span>
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handlePrintClick}
          >
            <Printer className="h-4 w-4 mr-1" />
            <span className={cn(isMobile ? "hidden" : "")}>Print</span>
          </Button>
        </div>
      </div>
      
      {/* Days header */}
      <div className="grid grid-cols-8 border-b">
        {/* Empty first cell for employee names */}
        <div className="p-2 border-r font-medium text-sm">Day notes</div>
        
        {/* Days of the week */}
        {weekDays.map((day) => (
          <div 
            key={day.dateStr}
            className={cn(
              "p-2 text-center border-r",
              day.isToday ? "bg-blue-50" : ""
            )}
          >
            <div className="font-medium">
              {day.dayName} {day.dayNumber}
            </div>
          </div>
        ))}
      </div>
      
      {/* Day notes row */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 border-r font-medium text-sm flex items-center">
          <span className="text-xs text-gray-500">Notes & Events</span>
        </div>
        
        {weekDays.map((day) => {
          const notes = getDayNotes(`${day.dayName} ${day.dayNumber}`);
          
          return (
            <div 
              key={day.dateStr}
              className={cn(
                "border-r p-2 min-h-[40px]",
                day.isToday ? "bg-blue-50/30" : ""
              )}
            >
              {notes.map((note, i) => (
                <div key={i} className="text-sm flex items-center">
                  <span className="text-gray-600">{note}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      
      {/* Departments and Employees */}
      <div className="divide-y">
        {Object.entries(shiftsByDepartment).map(([deptKey, department]) => (
          <Collapsible 
            key={deptKey} 
            open={department.isOpen}
            onOpenChange={() => toggleDepartment(deptKey)}
          >
            <CollapsibleTrigger className="flex items-center w-full p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1 font-medium text-sm">{department.name}</div>
              {isManager && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-auto h-7 px-2">
                        <Plus className="h-3.5 w-3.5" />
                        <span className={cn(isMobile ? "hidden" : "ml-1")}>Add Person</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add new employee to {department.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              {/* Open shifts row */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-2 border-r font-medium text-sm flex items-center">
                  <span>Open shifts</span>
                </div>
                
                {weekDays.map((day) => {
                  // This would fetch actual open shifts from a backend in a real app
                  const openShifts: { role: string, start: string, end: string }[] = [];
                  if (deptKey === 'service' && day.dayName === 'Tue') {
                    openShifts.push({ role: 'Waiter', start: '9:00 a', end: '5:00 p' });
                    openShifts.push({ role: 'Bartender', start: '9:00 a', end: '5:00 p' });
                  }
                  if (deptKey === 'service' && day.dayName === 'Wed') {
                    openShifts.push({ role: 'Hostess', start: '9:00 a', end: '5:00 p' });
                  }
                  if (deptKey === 'kitchen' && day.dayName === 'Fri') {
                    openShifts.push({ role: 'Chef', start: '9:00 a', end: '12:00 p' });
                    openShifts.push({ role: 'Assist.', start: '2:00 p', end: '10:00 p' });
                  }
                  
                  return (
                    <div 
                      key={day.dateStr} 
                      className={cn(
                        "border-r p-1 min-h-[60px]",
                        day.isToday ? "bg-blue-50/30" : ""
                      )}
                    >
                      {openShifts.map((shift, idx) => {
                        const roleClass = shift.role.toLowerCase().includes('chef') ? 'bg-green-100 text-green-800' :
                                          shift.role.toLowerCase().includes('waiter') ? 'bg-green-100 text-green-800' :
                                          shift.role.toLowerCase().includes('host') ? 'bg-orange-100 text-orange-800' :
                                          shift.role.toLowerCase().includes('bar') ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800';
                        
                        return (
                          <div 
                            key={idx}
                            className={cn(
                              "p-1 my-1 rounded-md text-xs border-l-4", 
                              roleClass,
                              shift.role.toLowerCase().includes('chef') ? 'border-l-green-500' :
                              shift.role.toLowerCase().includes('waiter') ? 'border-l-green-500' :
                              shift.role.toLowerCase().includes('host') ? 'border-l-orange-500' :
                              shift.role.toLowerCase().includes('bar') ? 'border-l-blue-500' :
                              'border-l-gray-500'
                            )}
                          >
                            <div className="font-medium">{shift.start} - {shift.end}</div>
                            <div>{shift.role}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              
              {/* Employee rows */}
              {Object.entries(department.employees).map(([employeeId, employee]) => (
                <div key={employeeId} className="grid grid-cols-8 border-b hover:bg-gray-50">
                  <div className="p-2 border-r flex items-center">
                    <div className="mr-2">
                      <Avatar className="h-8 w-8">
                        {employee.avatar && (
                          <AvatarImage src={employee.avatar} alt={employee.name} />
                        )}
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-medium text-sm truncate">{employee.name}</div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">{Math.round(employee.hours)}h</span> • {employee.role}
                      </div>
                    </div>
                  </div>
                  
                  {/* Days cells */}
                  {weekDays.map((day) => {
                    const shifts = employee.shifts[day.dateStr] || [];
                    const statusMarker = getEmployeeStatusMarker(employeeId, day.dateStr);
                    
                    return (
                      <div 
                        key={day.dateStr} 
                        className={cn(
                          "border-r min-h-[100px] p-1 relative",
                          day.isToday ? "bg-blue-50/30" : "",
                          statusMarker ? "bg-gray-50" : ""
                        )}
                      >
                        {statusMarker ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center text-sm text-gray-600 whitespace-pre-line">
                              {statusMarker.text}
                            </div>
                          </div>
                        ) : (
                          shifts.map((shift) => {
                            const shiftColorClass = getRoleColorClass(shift.title);
                            return (
                              <div 
                                key={shift.id} 
                                className={cn(
                                  "p-1 my-1 rounded-md text-xs cursor-pointer shift-card",
                                  shiftColorClass
                                )}
                              >
                                <div className="font-medium">{formatShiftTime(shift)}</div>
                                <div className="flex justify-between items-center">
                                  <span>{shift.title.split(' ')[0] === employee.name ? 
                                    shift.title.split(' ').slice(1).join(' ') : shift.title}</span>
                                  
                                  {shift.status === 'confirmed' && (
                                    <Badge variant="outline" className="ml-1 h-4 bg-green-50 text-green-700 text-[10px] px-1">
                                      ✓
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGridView;
