import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Info, Mail, XCircle, Clock, MapPin, User } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { Badge } from '@/components/ui/badge';
import ShiftResponseActions from './ShiftResponseActions';
import { cn } from '@/lib/utils';

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
  
  const formattedStartTime = format(startTime, 'HH:mm');
  const formattedEndTime = format(endTime, 'HH:mm');
  const formattedDate = format(startTime, 'EEE');
  const formattedDay = format(startTime, 'd');
  const formattedMonth = format(startTime, 'MMM').toUpperCase();
  
  const getStatusColor = () => {
    switch(schedule.status) {
      case 'pending': return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'confirmed': return 'bg-green-100 border-green-300 text-green-800';
      case 'completed': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'rejected': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  
  const isPending = schedule.status === 'pending';
  
  return (
    <div className="flex items-start space-x-4 bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm">
      {/* Date Box */}
      <div className="flex-shrink-0 w-16 h-16 bg-cyan-500 text-white rounded-lg flex flex-col items-center justify-center">
        <span className="text-sm font-medium">{formattedDate}</span>
        <span className="text-xl font-bold">{formattedDay}</span>
        <span className="text-xs">{formattedMonth}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              {formattedStartTime} → {formattedEndTime}
            </h3>
            <Badge 
              variant="outline" 
              className={`mt-1 ${getStatusColor()}`}
            >
              {schedule.status?.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>{format(endTime, 'H')} hours</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>{schedule.title || 'General Shift'}</span>
          </div>
          {schedule.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
              <span>{schedule.location}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={onInfoClick}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="Show Info"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={onEmailClick}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="Email about shift"
            >
              <Mail className="h-4 w-4" />
            </button>
            {!schedule.status?.includes('completed') && (
              <button
                onClick={onCancelClick}
                className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                aria-label="Cancel shift"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {isPending && (
            <ShiftResponseActions 
              schedule={schedule} 
              onResponseComplete={onResponseComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailCard;
