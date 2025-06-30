
import React from 'react';
import { WeekStats } from '@/types/restaurant-schedule';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { OpenShiftType } from '@/types/supabase/schedules';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

interface WeekSummaryColumnProps {
  weekStats: WeekStats;
  openShifts: OpenShiftType[];
  formatCurrency?: (amount: number, currency?: string, locale?: string) => string;
  handleAssignOpenShift: (openShiftId: string, employeeId?: string) => void;
  previousWeek: () => void;
  nextWeek: () => void;
  onShiftDragStart?: (e: React.DragEvent, shift: OpenShiftType) => void;
  onShiftDragEnd?: () => void;
}

const WeekSummaryColumn = ({ 
  weekStats, 
  openShifts,
  formatCurrency: customFormatCurrency,
  handleAssignOpenShift,
  previousWeek,
  nextWeek,
  onShiftDragStart,
  onShiftDragEnd
}: WeekSummaryColumnProps) => {
  // Format date range for display
  const formatDateRange = (startDate: Date, endDate: Date) => {
    const startMonth = format(startDate, 'MMM');
    const endMonth = format(endDate, 'MMM');
    
    if (startMonth === endMonth) {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
    }
    
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };
  
  // Calculate the date range for the current week
  const dateRange = formatDateRange(weekStats.startDate, weekStats.endDate);

  // Use the provided formatCurrency function or the imported one
  const currencyFormatter = customFormatCurrency || ((amount: number) => formatCurrency(amount, true));
  
  return (
    <div className="col-span-1 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Week navigation */}
      <div className="p-4 border-b border-gray-200 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={previousWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="font-medium text-sm">{dateRange}</span>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={nextWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Hours</span>
            <span className="font-medium">{weekStats.totalHours.toFixed(1)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-xs">Cost</span>
            <Badge variant="outline" className="bg-gray-100 hover:bg-gray-100">
              {currencyFormatter(weekStats.totalCost)}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Open shifts summary */}
      {openShifts.length > 0 && (
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-700 mb-2">Unassigned Shifts</h3>
          
          <div className={cn(
            "bg-orange-50 border border-orange-200 rounded-md p-2",
            openShifts.length > 0 ? "mb-1" : ""
          )}>
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">{openShifts.length} shifts</div>
              <div className="text-xs text-gray-600">{weekStats.openShiftsTotalHours.toFixed(1)}h</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Drag to assign</div>
          </div>
          
          <div className="max-h-[150px] overflow-y-auto">
            {openShifts.map(shift => (
              <div 
                key={shift.id} 
                draggable={true}
                onDragStart={(e) => onShiftDragStart?.(e, shift)}
                onDragEnd={onShiftDragEnd}
                className="bg-orange-50 border border-orange-200 rounded-md p-2 my-2 cursor-move hover:bg-orange-100 transition-colors"
              >
                <div className="font-medium text-xs">{shift.title || "Open Shift"}</div>
                <div className="text-xs text-gray-500">
                  {shift.start_time && format(new Date(shift.start_time), 'EEE, h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Role sections */}
      <div className="p-3 border-b border-gray-200 flex-1">
        <h3 className="text-xs font-medium text-gray-700 mb-2">Roles</h3>
        
        <div className="space-y-2">
          {weekStats.roles.map(role => (
            <div key={role.id} className="flex justify-between text-xs">
              <span className="text-gray-800">{role.name}</span>
              <span className="text-gray-600">{role.totalHours.toFixed(1)}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekSummaryColumn;
