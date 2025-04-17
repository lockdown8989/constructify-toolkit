
import { cn } from '@/lib/utils';
import { Coffee, FileText, UserPlus } from 'lucide-react';
import { OpenShift } from '@/types/restaurant-schedule';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OpenShiftBlockProps {
  openShift: OpenShift;
  color?: 'blue' | 'yellow' | 'purple' | 'green';
  onAssign?: (openShiftId: string, employeeId?: string) => void;
}

const OpenShiftBlock = ({ 
  openShift, 
  color = 'blue', 
  onAssign 
}: OpenShiftBlockProps) => {
  const colorClasses = {
    blue: 'border-l-[3px] border-blue-500 bg-blue-50/30',
    yellow: 'border-l-[3px] border-amber-500 bg-amber-50/30',
    purple: 'border-l-[3px] border-purple-500 bg-purple-50/30',
    green: 'border-l-[3px] border-green-500 bg-green-50/30',
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('scale-105', 'shadow', 'bg-blue-50/80', 'border', 'border-blue-300/50');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('scale-105', 'shadow', 'bg-blue-50/80', 'border', 'border-blue-300/50');
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('scale-105', 'shadow', 'bg-blue-50/80', 'border', 'border-blue-300/50');
    
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
        "active-touch-state" // For mobile touch interaction
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">{openShift.startTime} - {openShift.endTime}</span>
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
                className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-100/50"
                aria-label="Assign shift"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <span className="text-gray-700 text-sm">{openShift.role}</span>
      </div>
    </div>
  );
};

export default OpenShiftBlock;
