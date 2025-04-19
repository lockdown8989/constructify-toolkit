
import React from 'react';
import { format } from 'date-fns';
import { Clock, User, MapPin, Mail, X, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Schedule } from '@/types/schedule.types';
import { cn } from '@/lib/utils';

interface ShiftCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  schedule,
  onInfoClick,
  onEmailClick,
  onCancelClick
}) => {
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'pending':
        return 'bg-amber-100 border-amber-500 text-amber-700';
      case 'completed':
        return 'bg-gray-100 border-gray-500 text-gray-700';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-lg border-l-4 mb-3",
      getStatusColor(schedule.status)
    )}>
      <div className="flex-shrink-0 w-16 bg-cyan-500 text-white rounded-lg py-2 text-center">
        <div className="text-sm font-bold">{format(startTime, 'EEE').toUpperCase()}</div>
        <div className="text-2xl font-bold">{format(startTime, 'd')}</div>
        <div className="text-xs">{format(startTime, 'MMM')}</div>
      </div>
      
      <div className="flex-grow">
        <div className="text-xl font-bold mb-1">
          {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{duration} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{schedule.title || 'Staff'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{schedule.location || 'Main Location'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8"
          onClick={onInfoClick}
        >
          <Info className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8"
          onClick={onEmailClick}
        >
          <Mail className="h-4 w-4" />
        </Button>
        {schedule.status !== 'completed' && (
          <Button 
            variant="destructive" 
            size="icon"
            className="h-8 w-8"
            onClick={onCancelClick}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {schedule.status === 'completed' && (
          <div className="h-8 w-8 flex items-center justify-center text-green-500">
            <Check className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftCard;
