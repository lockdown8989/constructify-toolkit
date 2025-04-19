
import React from 'react';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

interface TimeLocationProps {
  startTime: Date;
  endTime: Date;
  location: string | undefined;
}

export const TimeLocation: React.FC<TimeLocationProps> = ({
  startTime,
  endTime,
  location
}) => {
  return (
    <div>
      <div className="text-lg font-semibold">
        {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>{location || 'Main Location'}</span>
      </div>
    </div>
  );
};
