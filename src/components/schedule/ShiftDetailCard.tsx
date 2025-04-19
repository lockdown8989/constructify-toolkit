
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Info, Mail, XCircle, MoreVertical } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { Badge } from '@/components/ui/badge';
import ShiftResponseActions from './ShiftResponseActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
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
        
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant()}>
            {schedule.status?.charAt(0).toUpperCase() + schedule.status?.slice(1)}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onInfoClick()}>
                <Info className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEmailClick()}>
                <Mail className="mr-2 h-4 w-4" />
                Contact Manager
              </DropdownMenuItem>
              {schedule.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onCancelClick()} className="text-red-600">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Shift
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      
      {/* Show response actions only for pending shifts */}
      {schedule.status === 'pending' && (
        <ShiftResponseActions 
          schedule={schedule} 
          onResponseComplete={onResponseComplete}
        />
      )}
    </div>
  );
};

export default ShiftDetailCard;
