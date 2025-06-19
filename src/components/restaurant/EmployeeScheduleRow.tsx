
import React, { useState } from 'react';
import { Employee, OpenShift } from '@/types/restaurant-schedule';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { OpenShiftType } from '@/types/supabase/schedules';

interface EmployeeScheduleRowProps {
  employee: Employee;
  days: string[];
  openShifts: OpenShiftType[];
  onAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  isMobile: boolean;
}

const EmployeeScheduleRow: React.FC<EmployeeScheduleRowProps> = ({
  employee,
  days,
  openShifts,
  onAssignOpenShift,
  isMobile
}) => {
  const [expanded, setExpanded] = useState(false);
  const initials = employee.name.split(' ').map(n => n[0]).join('');

  // Calculate employee shifts for the week
  const calculateEmployeeHours = () => {
    // This would normally come from actual shift data
    // For now, return a mock value
    return Math.floor(Math.random() * 40);
  };

  const employeeHours = calculateEmployeeHours();

  if (isMobile) {
    return (
      <div className="bg-white">
        {/* Mobile Employee Header */}
        <div className="flex items-center p-3 bg-gray-50/50">
          <Avatar className="h-8 w-8 mr-3 border border-gray-200">
            <AvatarImage src={employee.avatarUrl} alt={employee.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {employee.name}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium mr-2">{employeeHours}h</span>
              <span className="text-gray-400">•</span>
              <span className="ml-2">{employee.role}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="p-1"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile Days Grid (Expandable) */}
        {expanded && (
          <div className="p-3 pt-0">
            <div className="grid grid-cols-3 gap-2">
              {days.map((day) => (
                <div key={day} className="bg-gray-50 rounded-lg p-2 min-h-[60px]">
                  <div className="text-xs font-medium text-gray-600 mb-1 text-center">
                    {day.substring(0, 3)}
                  </div>
                  {/* Shift content would go here */}
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-gray-600"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="grid grid-cols-8 hover:bg-gray-50/50 transition-colors">
      {/* Employee Info Column */}
      <div className="p-3 border-r border-gray-200 flex items-center min-w-[150px]">
        <Avatar className="h-8 w-8 mr-3 border border-gray-200">
          <AvatarImage src={employee.avatarUrl} alt={employee.name} />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 truncate">
            {employee.name}
          </div>
          <div className="text-xs text-gray-500">
            {employee.role} • {employeeHours}h
          </div>
        </div>
      </div>

      {/* Day Columns */}
      {days.map((day) => (
        <div key={day} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] min-w-[100px]">
          {/* Shift content would go here */}
          <div className="flex justify-center items-center h-full">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-gray-600"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeScheduleRow;
