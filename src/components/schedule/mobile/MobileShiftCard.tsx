import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, User, MapPin, ChevronRight } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import ShiftResponseActions from '../ShiftResponseActions';

interface MobileShiftCardProps {
  schedule: Schedule;
  onClick?: () => void;
  onResponseComplete?: () => void;
}

const MobileShiftCard: React.FC<MobileShiftCardProps> = ({
  schedule,
  onClick,
  onResponseComplete
}) => {
  const startTime = parseISO(schedule.start_time);
  const endTime = parseISO(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  
  // Get day abbreviation and date
  const dayAbbr = format(startTime, 'EEE').toUpperCase();
  const dayNum = format(startTime, 'd');
  const monthAbbr = format(startTime, 'MMM').toUpperCase();

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-gradient-to-br from-orange-400 to-orange-500',
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          label: 'Pending Response'
        };
      case 'confirmed':
      case 'employee_accepted':
        return {
          color: 'bg-gradient-to-br from-blue-400 to-blue-500',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Confirmed'
        };
      case 'completed':
        return {
          color: 'bg-gradient-to-br from-green-400 to-green-500',
          badge: 'bg-green-100 text-green-800 border-green-200',
          label: 'Completed'
        };
      case 'rejected':
      case 'employee_rejected':
        return {
          color: 'bg-gradient-to-br from-red-400 to-red-500',
          badge: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rejected'
        };
      default:
        return {
          color: 'bg-gradient-to-br from-slate-400 to-slate-500',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(schedule.status);
  const isPending = schedule.status === 'pending';
  const isCompleted = schedule.status === 'completed';

  return (
    <div 
      className={cn(
        "bg-card rounded-xl border shadow-sm transition-all duration-200 overflow-hidden",
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Date Block */}
          <div className={cn(
            "text-white p-3 rounded-lg text-center w-16 flex-shrink-0 shadow-sm",
            statusConfig.color
          )}>
            <div className="text-xs font-medium opacity-90">{dayAbbr}</div>
            <div className="text-lg font-bold">{dayNum}</div>
            <div className="text-xs opacity-90">{monthAbbr}</div>
          </div>
          
          {/* Shift Details */}
          <div className="flex-1 min-w-0">
            {/* Time and Status */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold text-foreground">
                {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
              </div>
              {!isPending && (
                <Badge className={cn("text-xs", statusConfig.badge)}>
                  {statusConfig.label}
                </Badge>
              )}
            </div>
            
            {/* Shift Info */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{duration} hour{duration !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{schedule.title || 'Driver'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            
            {/* Action Buttons for Pending Shifts */}
            {isPending && (
              <ShiftResponseActions 
                schedule={schedule}
                onResponseComplete={onResponseComplete}
                size="sm"
                className="w-full"
              />
            )}
          </div>

          {/* Chevron for clickable cards */}
          {onClick && !isPending && (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileShiftCard;