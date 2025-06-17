
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MapPin, AlertCircle } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftResponseActions from '../ShiftResponseActions';
import { format } from 'date-fns';

interface PendingShiftCardProps {
  schedule: Schedule;
  onResponseComplete?: () => void;
}

const PendingShiftCard: React.FC<PendingShiftCardProps> = ({ 
  schedule, 
  onResponseComplete 
}) => {
  return (
    <Card className="p-4 border-orange-200 bg-orange-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="font-medium text-orange-800">Needs Response</span>
        </div>
        <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-100">
          Pending
        </Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {format(new Date(schedule.start_time), 'HH:mm')} - {format(new Date(schedule.end_time), 'HH:mm')}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span>{schedule.title}</span>
        </div>
        
        {schedule.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{schedule.location}</span>
          </div>
        )}
        
        {schedule.notes && (
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Notes: </span>
            {schedule.notes}
          </div>
        )}
      </div>
      
      <div className="border-t border-orange-200 pt-3">
        <p className="text-sm text-orange-700 mb-3">
          Please respond to this shift assignment
        </p>
        <ShiftResponseActions 
          schedule={schedule}
          onResponseComplete={onResponseComplete}
          size="sm"
          className="flex justify-center"
        />
      </div>
    </Card>
  );
};

export default PendingShiftCard;
