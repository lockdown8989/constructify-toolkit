
import React from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface ScheduleHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
}) => {
  return (
    <div className="bg-[#33C3F0] text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium">MY SCHEDULE</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:text-white/90 hover:bg-white/10"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onPreviousMonth}
          className="text-white hover:text-white/90 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-base font-medium">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onNextMonth}
          className="text-white hover:text-white/90 hover:bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ScheduleHeader;
