
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, User, MapPin, Mail, X, CheckCircle } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
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
  onResponseComplete
}) => {
  const startTime = parseISO(schedule.start_time);
  const endTime = parseISO(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  const isPending = schedule.status === 'pending';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-4">
        {/* Date Box */}
        <div className="flex-shrink-0 w-16 bg-blue-500 text-white rounded-lg py-2 text-center">
          <div className="text-lg font-bold">{format(startTime, 'EEE').toUpperCase()}</div>
          <div className="text-2xl font-bold">{format(startTime, 'd')}</div>
          <div className="text-sm">{format(startTime, 'MMM').toUpperCase()}</div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className={`text-sm font-medium mb-1 ${
            schedule.status === 'confirmed' ? 'text-green-500' :
            schedule.status === 'pending' ? 'text-amber-500' :
            'text-gray-500'
          }`}>
            {schedule.status?.toUpperCase()}
          </div>
          
          <div className="text-2xl font-bold mb-2">
            {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
          </div>
          
          <div className="space-y-1 text-gray-600 text-sm">
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
              <span>{schedule.location || 'Dalston, Kings Cross'}</span>
            </div>
          </div>
          
          <div className="flex justify-end items-center gap-2 mt-3">
            {isPending && (
              <ShiftResponseActions 
                schedule={schedule}
                onResponseComplete={onResponseComplete}
              />
            )}
            <Button 
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onInfoClick}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onEmailClick}
            >
              <Mail className="h-4 w-4" />
            </Button>
            {!isPending && (
              <Button 
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={onCancelClick}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailCard;
