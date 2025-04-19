
import React from 'react';
import { format } from 'date-fns';
import { Clock, User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Schedule } from '@/types/schedule.types';

interface ShiftCardProps {
  schedule: Schedule;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ schedule }) => {
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-cyan-100 text-cyan-950';
      case 'pending':
        return 'bg-amber-100 text-amber-950';
      case 'completed':
        return 'bg-gray-100 text-gray-950';
      default:
        return 'bg-gray-100 text-gray-950';
    }
  };

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className={cn(
        "flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center",
        "bg-cyan-500 text-white"
      )}>
        <div className="text-xs font-semibold">{format(startTime, 'EEE').toUpperCase()}</div>
        <div className="text-2xl font-bold">{format(startTime, 'd')}</div>
        <div className="text-xs">{format(startTime, 'MMM')}</div>
      </div>
      
      <div className="flex-1">
        <div className="text-lg font-semibold mb-1">
          {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{duration} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{schedule.title || 'Waitress'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{schedule.location || 'Main Location'}</span>
          </div>
        </div>
        
        {schedule.status && (
          <div className={cn(
            "mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            getStatusColor(schedule.status)
          )}>
            {schedule.status.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftCard;
