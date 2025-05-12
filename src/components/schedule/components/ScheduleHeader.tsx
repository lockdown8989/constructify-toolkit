
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleHeaderProps {
  onRefresh: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center px-4 pt-2 pb-4">
      <h2 className="text-xl font-semibold">Your Schedule</h2>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Refresh</span>
      </Button>
    </div>
  );
};

export default ScheduleHeader;
