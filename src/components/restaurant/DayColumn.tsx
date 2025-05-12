
import React, { useState } from 'react';
import { DayStats, Employee } from '@/types/restaurant-schedule';
import { Badge } from "@/components/ui/badge";
import { OpenShiftType } from '@/types/supabase/schedules';
import { cn } from '@/lib/utils';

interface DayColumnProps {
  day: string;
  dayLabel: string;
  dayStats: DayStats;
  employees: Employee[];
  openShifts: OpenShiftType[];
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  onShiftDragStart?: (e: React.DragEvent, shift: OpenShiftType) => void;
  onShiftDragEnd?: () => void;
  onShiftDrop?: (e: React.DragEvent, employeeId: string, day: string) => void;
}

const DayColumn = ({ 
  day, 
  dayLabel, 
  dayStats, 
  employees, 
  openShifts,
  handleAssignOpenShift,
  onShiftDragStart,
  onShiftDragEnd,
  onShiftDrop
}: DayColumnProps) => {
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, employeeId: string) => {
    e.preventDefault();
    setActiveDropTarget(employeeId);
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setActiveDropTarget(null);
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, employeeId: string) => {
    e.preventDefault();
    if (onShiftDrop) {
      onShiftDrop(e, employeeId, day);
    }
    setActiveDropTarget(null);
  };
  
  return (
    <div className="col-span-1 bg-white border-r border-gray-200 flex flex-col">
      {/* Day header with stats */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 text-sm sm:text-base">{dayLabel}</span>
            <span className="text-xs text-gray-500">
              {dayStats.totalHours.toFixed(1)} hrs
            </span>
          </div>
          <Badge variant="outline" className="bg-gray-100 hover:bg-gray-100">
            ${dayStats.totalCost.toFixed(0)}
          </Badge>
        </div>
      </div>
      
      {/* Open shifts section */}
      {openShifts.length > 0 && (
        <div className="py-2 px-2 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-2">Open Shifts</div>
          {openShifts.map(shift => (
            <div 
              key={shift.id}
              draggable={true}
              onDragStart={(e) => onShiftDragStart?.(e, shift)}
              onDragEnd={onShiftDragEnd}
              className="bg-orange-50 border border-orange-200 rounded-md p-2 mb-2 cursor-move hover:bg-orange-100 transition-colors"
            >
              <div className="font-medium text-xs">{shift.title}</div>
              <div className="text-xs text-gray-500">
                {shift.start_time && new Date(shift.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                {shift.end_time && ` - ${new Date(shift.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Employees section - where shifts can be dropped */}
      <div className="flex-1 overflow-y-auto">
        {employees.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No employees available
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {employees.map(employee => (
              <div 
                key={employee.id}
                className={cn(
                  "p-2 hover:bg-gray-50 transition-colors",
                  activeDropTarget === employee.id ? "bg-blue-50" : ""
                )}
                onDragOver={(e) => handleDragOver(e, employee.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, employee.id)}
              >
                <div className="font-medium text-xs truncate">{employee.name}</div>
                <div className="text-xs text-gray-500 truncate">{employee.role}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayColumn;
