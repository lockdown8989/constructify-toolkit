
import React from 'react';
import { format } from 'date-fns';
import { Clock, User, MapPin, Info, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Schedule } from '@/types/schedule.types';
import { cn } from '@/lib/utils';

interface ShiftDetailCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
}

export const ShiftDetailCard: React.FC<ShiftDetailCardProps> = ({
  schedule,
  onInfoClick,
  onEmailClick,
  onCancelClick
}) => {
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  
  return (
    <div className={cn(
      "p-4 rounded-xl border-l-4 mb-3",
      schedule.status === 'confirmed' ? "bg-green-50 border-l-green-500" :
      schedule.status === 'pending' ? "bg-orange-50 border-l-orange-500" :
      "bg-gray-50 border-l-gray-500"
    )}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold mb-2">
            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
          </div>
          
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {duration} hours
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {schedule.title}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {schedule.location || 'No location specified'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={onInfoClick}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View shift details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={onEmailClick}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contact manager</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {schedule.status !== 'completed' && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={onCancelClick}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailCard;
