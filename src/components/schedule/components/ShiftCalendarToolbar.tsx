
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAccessControl } from '@/hooks/leave/useAccessControl';
import AddEmployeeShiftButton from './AddEmployeeShiftButton';

interface ShiftCalendarToolbarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewType?: string;
  onViewChange?: (type: string) => void;
  onAddShift?: () => void;
  onAddEmployeeShift?: () => void;
}

const ShiftCalendarToolbar: React.FC<ShiftCalendarToolbarProps> = ({
  currentDate,
  onDateChange,
  viewType,
  onViewChange,
  onAddShift,
  onAddEmployeeShift
}) => {
  const { hasManagerAccess } = useAccessControl();
  const handleSelectToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSelectToday}
      >
        Today
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="pl-3 pr-3 text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{format(currentDate, 'PPP')}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => {
              if (date) onDateChange(date);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {viewType && onViewChange && (
        <div className="flex space-x-1">
          <Button 
            variant={viewType === 'day' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('day')}
          >
            Day
          </Button>
          <Button 
            variant={viewType === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('week')}
          >
            Week
          </Button>
          <Button 
            variant={viewType === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('month')}
          >
            Month
          </Button>
        </div>
      )}
      
      {hasManagerAccess && onAddShift && (
        <Button
          onClick={onAddShift}
          variant="default"
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Shift
        </Button>
      )}

      {hasManagerAccess && onAddEmployeeShift && (
        <Button
          onClick={onAddEmployeeShift}
          variant="default"
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white ml-auto"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Add Employee Shift
        </Button>
      )}
    </div>
  );
};

export default ShiftCalendarToolbar;
