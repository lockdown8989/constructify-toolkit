
import { cn } from '@/lib/utils';
import { Coffee, FileText, Plus, UserPlus } from 'lucide-react';
import { OpenShift } from '@/types/restaurant-schedule';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OpenShiftBlockProps {
  openShift: OpenShift;
  color?: 'blue' | 'yellow';
  onAssign?: (openShiftId: string, employeeId?: string) => void;
}

const OpenShiftBlock = ({ 
  openShift, 
  color = 'blue', 
  onAssign 
}: OpenShiftBlockProps) => {
  const colorClasses = {
    blue: 'border-l-4 border-blue-500 bg-white',
    yellow: 'border-l-4 border-yellow-500 bg-white',
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData('employeeId');
    if (employeeId && onAssign) {
      onAssign(openShift.id, employeeId);
    }
  };
  
  return (
    <div 
      className={cn(
        "p-3 my-1 rounded-xl shadow-sm hover:shadow transition-all relative",
        colorClasses[color],
        "droppable-area"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">{openShift.startTime} - {openShift.endTime}</span>
          <div className="flex space-x-1">
            {openShift.notes && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{openShift.notes}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onAssign && (
              <button 
                onClick={() => onAssign(openShift.id)} 
                className="text-blue-500 hover:text-blue-700 transition-colors"
                aria-label="Assign shift"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <span className="text-gray-700 text-sm">{openShift.role}</span>
      </div>
      
      {/* Visual feedback for drag target */}
      <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-xl opacity-0 hover:opacity-50 transition-opacity pointer-events-none droppable-highlight"></div>
    </div>
  );
};

export default OpenShiftBlock;
