
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, User, MapPin, Info, Mail, X, Check } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  
  const getStatusColor = (status: string | undefined) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'confirmed': return 'bg-green-100 border-green-300 text-green-800';
      case 'completed': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'rejected': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const isPending = schedule.status === 'pending';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex items-start gap-4">
        {/* Date Box */}
        <div className="flex-shrink-0 w-20 h-20 bg-cyan-500 text-white rounded-lg flex flex-col items-center justify-center">
          <span className="text-lg font-medium">{format(startTime, 'EEE')}</span>
          <span className="text-2xl font-bold">{format(startTime, 'd')}</span>
          <span className="text-sm">{format(startTime, 'MMM').toUpperCase()}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
              </h3>
              <Badge 
                variant="outline" 
                className={cn("mb-2", getStatusColor(schedule.status))}
              >
                {schedule.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{duration} hours</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <span>{schedule.title || 'Driver'}</span>
            </div>
            {schedule.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{schedule.location}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={onInfoClick}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View details</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={onEmailClick}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Contact manager</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {isPending ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => onResponseComplete?.()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={onCancelClick}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            ) : (
              !schedule.status?.includes('completed') && (
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={onCancelClick}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailCard;
