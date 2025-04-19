
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Info, Mail, XCircle, Clock } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { Badge } from '@/components/ui/badge';
import ShiftResponseActions from './ShiftResponseActions';

interface ShiftDetailCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
  onResponseComplete?: () => void;
}

const ShiftDetailCard: React.FC<ShiftDetailCardProps> = ({
  schedule,
  onInfoClick,
  onEmailClick,
  onCancelClick,
  onResponseComplete,
}) => {
  const startTime = parseISO(schedule.start_time);
  const endTime = parseISO(schedule.end_time);
  
  const formattedDate = format(startTime, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startTime, 'h:mm a');
  const formattedEndTime = format(endTime, 'h:mm a');
  
  // Determine badge variant based on status
  const getBadgeVariant = () => {
    switch(schedule.status) {
      case 'pending': return 'outline';
      case 'confirmed': return 'default';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };
  
  return (
    <div className={`bg-white rounded-lg border ${schedule.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'} p-4 mb-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-medium">{schedule.title}</h3>
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="text-gray-500 text-sm">
            {formattedStartTime} - {formattedEndTime}
          </div>
        </div>
        <Badge variant={getBadgeVariant()} className={schedule.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}>
          {schedule.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
          {schedule.status?.charAt(0).toUpperCase() + schedule.status?.slice(1)}
        </Badge>
      </div>
      
      {schedule.location && (
        <div className="text-gray-600 text-sm mb-3">
          📍 {schedule.location}
        </div>
      )}
      
      {schedule.notes && (
        <div className="text-gray-600 text-sm mb-3">
          📝 {schedule.notes}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={onInfoClick}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
            aria-label="Show Info"
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            onClick={onEmailClick}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
            aria-label="Email about shift"
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            onClick={onCancelClick}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
            aria-label="Cancel shift"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
        
        {/* Show response actions only for pending shifts */}
        {schedule.status === 'pending' && (
          <ShiftResponseActions 
            schedule={schedule} 
            onResponseComplete={onResponseComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ShiftDetailCard;
