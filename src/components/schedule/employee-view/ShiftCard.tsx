
import React from 'react';
import { format } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';
import { Schedule } from '@/types/supabase/schedules';
import { Badge } from '@/components/ui/badge';

interface ShiftCardProps {
  shift: Schedule;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift }) => {
  const startTime = new Date(shift.start_time);
  const endTime = new Date(shift.end_time);
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-3 border border-gray-100">
      <div className="flex gap-3">
        <div className="bg-[#33C3F0] text-white rounded-lg p-2 text-center w-16 h-16 flex flex-col justify-center">
          <div className="text-xs uppercase">{format(startTime, 'EEE')}</div>
          <div className="text-2xl font-bold">{format(startTime, 'd')}</div>
          <div className="text-xs uppercase">{format(startTime, 'MMM')}</div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="text-lg font-medium">
              {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
            </div>
            <Badge 
              variant="outline" 
              className={
                shift.status === 'confirmed' 
                  ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                  : shift.status === 'pending'
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : 'border-gray-200'
              }
            >
              {shift.status?.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{duration} hours</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5" />
              <span>{shift.location || 'No location set'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
