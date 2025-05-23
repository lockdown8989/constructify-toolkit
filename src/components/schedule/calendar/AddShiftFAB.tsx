
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AddShiftFABProps {
  onClick: () => void;
  isVisible: boolean;
}

const AddShiftFAB: React.FC<AddShiftFABProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('AddShiftFAB clicked, calling onClick handler');
    onClick();
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg bg-blue-600 hover:bg-blue-700"
            variant="default"
            data-testid="add-shift-fab"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Shift</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add new shift to schedule</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddShiftFAB;
