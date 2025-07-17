
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, User, MapPin, Info } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';
import ShiftResponseActions from '../ShiftResponseActions';

interface ShiftCardProps {
  schedule: Schedule;
  onResponseComplete?: () => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  schedule,
  onResponseComplete
}) => {
  const startTime = parseISO(schedule.start_time);
  const endTime = parseISO(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  
  // Get day abbreviation and date
  const dayAbbr = format(startTime, 'EEE').toUpperCase();
  const dayNum = format(startTime, 'd');
  const monthAbbr = format(startTime, 'MMM').toUpperCase();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
      case 'employee_accepted':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-orange-500';
      case 'rejected':
      case 'employee_rejected':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'employee_accepted':
        return 'confirmed';
      case 'employee_rejected':
        return 'rejected';
      case 'completed':
        return 'completed';
      case 'pending':
        return 'pending';
      default:
        return status || 'confirmed';
    }
  };

  const isPending = schedule.status === 'pending';
  const isCompleted = schedule.status === 'completed';

  return (
    <div className="bg-card rounded-xl shadow-sm border p-4 mb-3 transition-all duration-200 hover:shadow-md active-touch-state">
      {isCompleted && (
        <div className="text-green-600 text-sm font-medium mb-2 uppercase">
          COMPLETED
        </div>
      )}
      
      <div className="flex items-start gap-4">
        {/* Date box */}
        <div className={cn(
          "text-white p-3 rounded-lg text-center w-16 flex-shrink-0 shadow-sm",
          getStatusColor(schedule.status)
        )}>
          <div className="text-xs font-medium opacity-90">{dayAbbr}</div>
          <div className="text-lg font-bold">{dayNum}</div>
          <div className="text-xs opacity-90">{monthAbbr}</div>
        </div>
        
        {/* Shift details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="text-lg font-semibold text-foreground">
              {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
            </div>
            {!isPending && !isCompleted && (
              <Info className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{duration} hour{duration !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{schedule.title || 'Driver'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{schedule.location || 'Location TBD'}</span>
            </div>
          </div>

          {/* Notes */}
          {schedule.notes && (
            <div className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded-md">
              {schedule.notes}
            </div>
          )}

          {/* Status badge for non-pending shifts */}
          {!isPending && (
            <div className="mb-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border",
                schedule.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                schedule.status === 'employee_rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-blue-100 text-blue-800 border-blue-200'
              )}>
                {getStatusLabel(schedule.status)}
              </span>
            </div>
          )}
          
          {/* Action buttons for pending shifts */}
          {isPending && (
            <ShiftResponseActions 
              schedule={schedule}
              onResponseComplete={onResponseComplete}
              size="sm"
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
