
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScheduleViewSelectorProps {
  viewType: 'day' | 'week' | 'month';
  onViewChange: (type: 'day' | 'week' | 'month') => void;
}

const ScheduleViewSelector: React.FC<ScheduleViewSelectorProps> = ({
  viewType,
  onViewChange
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center space-x-1 bg-gray-100 rounded-md p-1 ${isMobile ? 'w-full' : ''}`}>
      <Button
        variant={viewType === 'day' ? 'default' : 'ghost'}
        size="sm"
        className={`${viewType === 'day' ? '' : 'text-gray-600'} ${isMobile ? 'flex-1' : ''}`}
        onClick={() => onViewChange('day')}
      >
        Day
      </Button>
      <Button
        variant={viewType === 'week' ? 'default' : 'ghost'}
        size="sm"
        className={`${viewType === 'week' ? '' : 'text-gray-600'} ${isMobile ? 'flex-1' : ''}`}
        onClick={() => onViewChange('week')}
      >
        Week
      </Button>
      <Button
        variant={viewType === 'month' ? 'default' : 'ghost'}
        size="sm"
        className={`${viewType === 'month' ? '' : 'text-gray-600'} ${isMobile ? 'flex-1' : ''}`}
        onClick={() => onViewChange('month')}
      >
        Month
      </Button>
    </div>
  );
};

export default ScheduleViewSelector;
