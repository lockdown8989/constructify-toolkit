
import React from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Mail, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Schedule } from '@/types/supabase/schedules';

interface ShiftCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  schedule,
  onInfoClick,
  onEmailClick,
  onCancelClick
}) => {
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all hover:shadow-sm",
      schedule.status === 'confirmed' ? "border-green-200 bg-green-50" :
      schedule.status === 'pending' ? "border-orange-200 bg-orange-50" :
      "border-gray-200 bg-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-lg flex flex-col items-center justify-center",
            schedule.status === 'confirmed' ? "bg-green-100 text-green-700" :
            schedule.status === 'pending' ? "bg-orange-100 text-orange-700" :
            "bg-gray-100 text-gray-700"
          )}>
            <span className="text-xs font-medium">
              {format(startTime, 'MMM').toUpperCase()}
            </span>
            <span className="text-lg font-bold">
              {format(startTime, 'd')}
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{schedule.location || 'Main Location'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onInfoClick}
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEmailClick}
          >
            <Mail className="h-4 w-4" />
          </Button>
          {schedule.status === 'pending' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancelClick}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
