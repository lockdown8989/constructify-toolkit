import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, User, MapPin, Info, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';

interface ShiftDetailCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
}

const ShiftDetailCard: React.FC<ShiftDetailCardProps> = ({
  schedule,
  onInfoClick,
  onEmailClick,
  onCancelClick
}) => {
  const startTime = parseISO(schedule.start_time);
  const endTime = parseISO(schedule.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  const isCompleted = schedule.status === 'completed';
  
  return (
    <div className="p-4 bg-white rounded-xl shadow-md mb-3">
      <div className="flex items-start">
        {/* Date box */}
        <div className="bg-blue-500 text-white p-2 rounded-lg text-center w-20 mr-3">
          <div className="text-lg font-bold">{format(startTime, 'EEE').toUpperCase()}</div>
          <div className="text-2xl font-bold">{format(startTime, 'd')}</div>
          <div className="text-sm">{format(startTime, 'MMM').toUpperCase()}</div>
        </div>
        
        {/* Shift details */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
              schedule.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {(schedule.status || 'CONFIRMED').toUpperCase()}
            </span>
          </div>
          
          <div className="text-2xl font-bold mb-1">
            {format(startTime, 'HH:mm')} → {format(endTime, 'HH:mm')}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
              <span>{duration} hours</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1.5 text-gray-500" />
              <span>Williams</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
              <span>{schedule.location || 'Kings Cross'}</span>
            </div>
          </div>
          
          <div className="flex mt-3 space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={onInfoClick}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shift details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
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
            
            {!isCompleted && (
              <Button 
                variant="outline" 
                className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50"
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
