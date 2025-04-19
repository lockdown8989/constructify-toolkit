
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, User, MapPin, Mail } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
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
  onEmailClick,
}) => {
  const startTime = parseISO(schedule.start_time);
  const endTime = parseISO(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  const dayName = format(startTime, 'EEE').toUpperCase();
  const dayNumber = format(startTime, 'd');
  const month = format(startTime, 'LLL').toUpperCase();
  
  return (
    <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
      <div className="flex items-stretch">
        {/* Date Box */}
        <div className="w-24 bg-sky-500 text-white p-3 flex flex-col items-center justify-center">
          <div className="text-lg font-bold">{dayName}</div>
          <div className="text-3xl font-bold">{dayNumber}</div>
          <div className="text-sm font-medium">{month}</div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="text-2xl font-bold mb-2">
            {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
          </div>
          
          <div className="space-y-2 text-gray-600">
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
              <span>{schedule.location || 'Dishoom, Kings Cross'}</span>
            </div>
          </div>
          
          <div className="flex justify-end items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onEmailClick}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-6"
              size="sm"
            >
              accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailCard;
