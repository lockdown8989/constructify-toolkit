
import React from 'react';
import { format } from 'date-fns';
import { ArrowLeftRight, UserPlus, Calendar, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShiftActionsMenuProps {
  date: Date;
  onAddShift: (date: Date) => void;
  onSwapShift: (date: Date) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
  disabled?: boolean;
}

const ShiftActionsMenu: React.FC<ShiftActionsMenuProps> = ({
  date,
  onAddShift,
  onSwapShift,
  isOpen,
  onOpenChange,
  triggerClassName,
  disabled = false
}) => {
  const isMobile = useIsMobile();
  
  const handleAddShift = () => {
    onAddShift(date);
  };
  
  const handleSwapShift = () => {
    onSwapShift(date);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className={cn("cursor-pointer", triggerClassName, disabled && "pointer-events-none opacity-50")}>
          {/* This can be any children element */}
          <div className="w-full h-full flex items-center justify-center">
            {isMobile ? (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            ) : (
              <div className="text-sm text-blue-600">{format(date, 'd')}</div>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 z-50 bg-white shadow-lg rounded-md border border-gray-200">
        <div className="px-2 py-1.5 mb-2 border-b">
          <p className="text-sm font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left text-sm" 
            onClick={handleAddShift}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Shift to Employee
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left text-sm" 
            onClick={handleSwapShift}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Swap Shift with Another Employee
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left text-sm text-gray-500"
          >
            <Clock className="mr-2 h-4 w-4" />
            View All Shifts
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShiftActionsMenu;
