
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
      {isCompleted && (
        <div className="text-green-600 text-sm font-medium mb-2 uppercase">
          COMPLETED
        </div>
      )}
      
      <div className="flex items-start">
        {/* Date box */}
        <div className={cn(
          "text-white p-3 rounded-lg text-center w-16 mr-4 flex-shrink-0",
          getStatusColor(schedule.status)
        )}>
          <div className="text-xs font-medium">{dayAbbr}</div>
          <div className="text-lg font-bold">{dayNum}</div>
          <div className="text-xs">{monthAbbr}</div>
        </div>
        
        {/* Shift details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xl font-bold">
              {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
            </div>
            {!isPending && !isCompleted && (
              <Info className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{duration} hours</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{schedule.title || 'Driver'}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{schedule.location || 'Dishoom, Kings Cross'}</span>
            </div>
          </div>

          {/* Status badge for non-pending shifts */}
          {!isPending && (
            <div className="mb-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                schedule.status === 'employee_rejected' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
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
              className="justify-start"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
