
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

interface ShiftCalendarToolbarProps {
  viewType: 'day' | 'week';
  onViewChange: (type: 'day' | 'week') => void;
}

const ShiftCalendarToolbar: React.FC<ShiftCalendarToolbarProps> = ({
  viewType,
  onViewChange,
}) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-md border p-0.5">
      <Button
        variant={viewType === 'day' ? 'default' : 'ghost'}
        size="sm"
        className="text-xs"
        onClick={() => onViewChange('day')}
      >
        <Calendar className="h-4 w-4 mr-1" />
        Day
      </Button>
      <Button
        variant={viewType === 'week' ? 'default' : 'ghost'}
        size="sm"
        className="text-xs"
        onClick={() => onViewChange('week')}
      >
        <Clock className="h-4 w-4 mr-1" />
        Week
      </Button>
    </div>
  );
};

export default ShiftCalendarToolbar;
