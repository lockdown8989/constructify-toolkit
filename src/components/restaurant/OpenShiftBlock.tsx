
import { cn } from '@/lib/utils';
import { Coffee, FileText, UserPlus } from 'lucide-react';
import { OpenShiftType } from '@/types/supabase/schedules';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShiftDrag } from '@/hooks/use-shift-drag';

interface OpenShiftBlockProps {
  openShift: OpenShiftType;
  color?: 'blue' | 'yellow' | 'purple' | 'green';
  compact?: boolean;
  handleAssignOpenShift?: (openShiftId: string, employeeId?: string) => void;
  onAssign?: (openShiftId: string, employeeId?: string) => void;
  position?: number;
}

const OpenShiftBlock = ({ 
  openShift, 
  color = 'blue', 
  compact = false,
  handleAssignOpenShift,
  onAssign,
  position
}: OpenShiftBlockProps) => {
  const { isDragging, setIsDragging, updateShiftPosition } = useShiftDrag();
  
  const colorClasses = {
    blue: 'border-l-[3px] border-blue-500 bg-blue-50/30',
    yellow: 'border-l-[3px] border-amber-500 bg-amber-50/30',
    purple: 'border-l-[3px] border-purple-500 bg-purple-50/30',
    green: 'border-l-[3px] border-green-500 bg-green-50/30',
  };
  
  const handleDragStart = (e: React.DragEvent) => {
    if (openShift.drag_disabled) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      shiftId: openShift.id,
      currentPosition: position
    }));
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.currentTarget as HTMLElement;
    target.classList.add('scale-105', 'shadow-md', 'bg-blue-50/80', 'border-blue-300/50');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('scale-105', 'shadow-md', 'bg-blue-50/80', 'border-blue-300/50');
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('scale-105', 'shadow-md', 'bg-blue-50/80', 'border-blue-300/50');
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (position !== undefined && data.currentPosition !== position) {
      try {
        await updateShiftPosition.mutateAsync({
          shiftId: data.shiftId,
          newPosition: position
        });
      } catch (error) {
        console.error('Error updating position:', error);
      }
    }
  };
  
  return (
    <div 
      className={cn(
        "p-3 my-1 rounded-xl shadow-sm transition-all relative cursor-move",
        colorClasses[color],
        isDragging && "opacity-50",
        !openShift.drag_disabled && "hover:shadow-md active:scale-95",
        "touch-action-none" // Better touch handling
      )}
      draggable={!openShift.drag_disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="open-shift-block"
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
            {(handleAssignOpenShift || onAssign) && (
              <button 
                onClick={handleAssign}
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
