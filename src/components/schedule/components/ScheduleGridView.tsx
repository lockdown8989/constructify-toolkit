
import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Filter, Printer } from 'lucide-react';
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

interface ScheduleGridViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
}

type SchedulesByEmployee = {
  [employeeId: string]: {
    name: string;
    role: string;
    hours: number;
    shifts: Record<string, Schedule[]>;
    avatar?: string;
  };
};

type DepartmentGroup = {
  name: string;
  employees: SchedulesByEmployee;
  isOpen: boolean;
};

const ScheduleGridView: React.FC<ScheduleGridViewProps> = ({
  currentDate,
  onDateChange,
  schedules
}) => {
  const isMobile = useIsMobile();
  const { isManager } = useAuth();
  const [departments, setDepartments] = useState<DepartmentGroup[]>([
    { name: 'KITCHEN STAFF', employees: {}, isOpen: true },
    { name: 'SERVICE STAFF', employees: {}, isOpen: true },
    { name: 'ADMIN STAFF', employees: {}, isOpen: false }
  ]);

  // Generate the days for the week view
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const day = addDays(startOfCurrentWeek, index);
    const isToday = isSameDay(day, new Date());
    const dateStr = format(day, 'EEE dd');
    const [dayName, dayNumber] = dateStr.split(' ');
    
    return { 
      date: day, 
      dayName, 
      dayNumber, 
      isToday,
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });

  // Group schedules by employee and departments
  const organizeSchedules = () => {
    const employeeSchedules: SchedulesByEmployee = {};
    const deptMap: Record<string, string> = {
      'chef': 'KITCHEN STAFF',
      'sous-chef': 'KITCHEN STAFF',
      'cook': 'KITCHEN STAFF',
      'waiter': 'SERVICE STAFF',
      'bartender': 'SERVICE STAFF',
      'hostess': 'SERVICE STAFF',
      'manager': 'ADMIN STAFF',
    };
    
    // Process all schedules
    schedules.forEach(schedule => {
      const employeeId = schedule.employee_id;
      const role = schedule.title.toLowerCase().includes('chef') ? 'chef' :
                   schedule.title.toLowerCase().includes('cook') ? 'cook' :
                   schedule.title.toLowerCase().includes('waiter') ? 'waiter' :
                   schedule.title.toLowerCase().includes('bar') ? 'bartender' :
                   schedule.title.toLowerCase().includes('host') ? 'hostess' : 'staff';
      
      // Get the day key for this schedule
      const scheduleDate = new Date(schedule.start_time);
      const dayKey = format(scheduleDate, 'yyyy-MM-dd');
      
      // Initialize employee record if needed
      if (!employeeSchedules[employeeId]) {
        employeeSchedules[employeeId] = {
          name: schedule.title.split(' ')[0] || 'Employee',
          role,
          hours: 0,
          shifts: {},
        };
      }
      
      // Initialize the day array for this employee if needed
      if (!employeeSchedules[employeeId].shifts[dayKey]) {
        employeeSchedules[employeeId].shifts[dayKey] = [];
      }
      
      // Add this schedule to the employee's shifts for this day
      employeeSchedules[employeeId].shifts[dayKey].push(schedule);
      
      // Calculate hours worked
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);
      const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      employeeSchedules[employeeId].hours += hoursWorked;
    });

    // Update departments with employees
    const updatedDepartments = [...departments];
    updatedDepartments.forEach(dept => {
      dept.employees = {};
    });
    
    // Assign employees to departments
    Object.entries(employeeSchedules).forEach(([employeeId, details]) => {
      const deptName = deptMap[details.role] || 'ADMIN STAFF';
      const deptIndex = updatedDepartments.findIndex(d => d.name === deptName);
      if (deptIndex >= 0) {
        updatedDepartments[deptIndex].employees[employeeId] = details;
      }
    });
    
    setDepartments(updatedDepartments);
  };
  
  // Call organizeSchedules whenever schedules change
  React.useEffect(() => {
    organizeSchedules();
  }, [schedules]);

  const toggleDepartment = (index: number) => {
    const updatedDepts = [...departments];
    updatedDepts[index].isOpen = !updatedDepts[index].isOpen;
    setDepartments(updatedDepts);
  };

  const handlePrevWeek = () => {
    onDateChange(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    onDateChange(addDays(currentDate, 7));
  };

  const getShiftColorClass = (title: string) => {
    if (title.toLowerCase().includes('chef') || title.toLowerCase().includes('cook')) {
      return 'bg-green-100 text-green-800 border-l-4 border-l-green-500';
    }
    if (title.toLowerCase().includes('waiter')) {
      return 'bg-emerald-100 text-emerald-800 border-l-4 border-l-emerald-500';
    }
    if (title.toLowerCase().includes('bar')) {
      return 'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500';
    }
    if (title.toLowerCase().includes('host')) {
      return 'bg-orange-100 text-orange-800 border-l-4 border-l-orange-500';
    }
    return 'bg-gray-100 text-gray-800 border-l-4 border-l-gray-500';
  };

  const renderShifts = (shifts: Schedule[] | undefined) => {
    if (!shifts || shifts.length === 0) return null;
    
    return shifts.map((shift, idx) => {
      const start = new Date(shift.start_time);
      const end = new Date(shift.end_time);
      const startStr = format(start, 'h:mm a').replace(':00', '');
      const endStr = format(end, 'h:mm a').replace(':00', '');
      const displayTime = `${startStr} - ${endStr}`;
      
      return (
        <div 
          key={shift.id + idx} 
          className={cn(
            "p-1 my-1 rounded text-xs", 
            getShiftColorClass(shift.title)
          )}
        >
          <div className="font-medium">{displayTime}</div>
          <div>{shift.title}</div>
        </div>
      );
    });
  };

  const getOpenShifts = (dateStr: string, employeeRole: string) => {
    // Here we could filter open shifts for a specific day and role
    return [];
  };

  const renderOpenShifts = (dayStr: string, dept: string) => {
    const deptRoles = dept === 'KITCHEN STAFF' 
      ? ['chef', 'sous-chef', 'cook'] 
      : ['waiter', 'bartender', 'hostess'];
    
    const openShifts: JSX.Element[] = [];
    
    deptRoles.forEach(role => {
      const shifts = getOpenShifts(dayStr, role);
      if (shifts.length > 0) {
        // Render open shifts here
      }
    });
    
    return openShifts.length > 0 ? openShifts : null;
  };

  return (
    <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
      {/* Header with navigation and controls */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button variant="secondary" className="ml-2">Today</Button>
          <Button variant="ghost">This Week</Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {isManager && (
            <>
              <Button variant="outline" size="sm" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                <span className={cn(isMobile ? "hidden" : "")}>Add Group</span>
              </Button>
              
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                <span className={cn(isMobile ? "hidden" : "")}>Filter</span>
              </Button>
            </>
          )}
          
          <Button variant="outline" size="sm" className="flex items-center">
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
        {weekDays.map((day, index) => (
          <div 
            key={index}
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
      
      {/* Departments and Employees */}
      <div className="divide-y">
        {departments.map((dept, deptIndex) => (
          <Collapsible 
            key={dept.name} 
            open={dept.isOpen}
            onOpenChange={() => toggleDepartment(deptIndex)}
          >
            <CollapsibleTrigger className="flex items-center w-full p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1 font-medium text-sm">{dept.name}</div>
              {isManager && (
                <Button variant="ghost" size="sm" className="ml-auto" onClick={(e) => e.stopPropagation()}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span className={cn(isMobile ? "hidden" : "")}>Add Person</span>
                </Button>
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              {/* Open shifts row */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-2 border-r font-medium text-sm">Open shifts</div>
                
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="border-r min-h-[60px] p-1">
                    {renderOpenShifts(day.dateStr, dept.name)}
                  </div>
                ))}
              </div>
              
              {/* Employee rows */}
              {Object.entries(dept.employees).map(([employeeId, employee]) => (
                <div key={employeeId} className="grid grid-cols-8 border-b">
                  <div className="p-2 border-r flex items-center">
                    <div className="mr-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{employee.name}</div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">{employee.hours.toFixed(0)}h</span> • {employee.role}
                      </div>
                    </div>
                  </div>
                  
                  {/* Days cells */}
                  {weekDays.map((day, dayIndex) => (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "border-r min-h-[100px] p-1",
                        day.isToday ? "bg-blue-50/30" : ""
                      )}
                    >
                      {renderShifts(employee.shifts[day.dateStr])}
                    </div>
                  ))}
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
