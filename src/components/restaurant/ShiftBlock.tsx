
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Coffee, FileText, Plane, Trash, Edit, Plus } from 'lucide-react';
import { Shift } from '@/types/restaurant-schedule';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShiftBlockProps {
  shift: Shift;
  color?: 'red' | 'blue' | 'yellow';
  onEdit?: (shift: Shift) => void;
  onDelete?: (shiftId: string) => void;
  onAddNote?: (shiftId: string) => void;
  onAddBreak?: (shiftId: string) => void;
}

const ShiftBlock = ({ 
  shift, 
  color = 'blue', 
  onEdit, 
  onDelete,
  onAddNote,
  onAddBreak
}: ShiftBlockProps) => {
  const [showActions, setShowActions] = useState(false);
  
  const colorClasses = {
    red: 'border-l-3 border-red-500 bg-white',
    blue: 'border-l-3 border-blue-500 bg-white',
    yellow: 'border-l-3 border-yellow-500 bg-white',
  };
  
  if (shift.isUnavailable) {
    return (
      <div className="p-2 my-1 bg-blue-50 border border-dashed border-blue-200 rounded-xl flex items-center justify-center h-16 shadow-sm">
        <div className="flex flex-col items-center text-blue-500">
          <Plane className="h-5 w-5 mb-1" />
          <span className="text-xs text-gray-500">{shift.unavailabilityReason || 'unavailable'}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "p-3 my-1 rounded-xl shadow-sm hover:shadow transition-all relative",
        colorClasses[color]
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">{shift.startTime} - {shift.endTime}</span>
          <div className="flex space-x-1">
            {shift.hasBreak && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Coffee className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Break: {shift.breakDuration} minutes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {shift.notes && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{shift.notes}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <span className="text-gray-700 text-sm">{shift.role}</span>
      </div>
      
      {showActions && (
        <div className="absolute right-1 bottom-1 flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          {!shift.notes && onAddNote && (
            <button 
              onClick={() => onAddNote(shift.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Add note"
            >
              <FileText className="h-3.5 w-3.5 text-gray-600" />
            </button>
          )}
          
          {!shift.hasBreak && onAddBreak && (
            <button 
              onClick={() => onAddBreak(shift.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Add break"
            >
              <Coffee className="h-3.5 w-3.5 text-gray-600" />
            </button>
          )}
          
          {onEdit && (
            <button 
              onClick={() => onEdit(shift)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Edit shift"
            >
              <Edit className="h-3.5 w-3.5 text-gray-600" />
            </button>
          )}
          
          {onDelete && (
            <button 
              onClick={() => onDelete(shift.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Delete shift"
            >
              <Trash className="h-3.5 w-3.5 text-red-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftBlock;
