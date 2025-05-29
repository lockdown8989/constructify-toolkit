
import React from 'react';
import { format } from 'date-fns';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';

interface ScheduleDateContextMenuProps {
  children: React.ReactNode;
  date: Date;
  schedules: Schedule[];
  isManager: boolean;
  onEditShift: (schedule: Schedule) => void;
  onAddShift: (date: Date) => void;
  onDeleteShift: (schedule: Schedule) => void;
}

const ScheduleDateContextMenu: React.FC<ScheduleDateContextMenuProps> = ({
  children,
  date,
  schedules,
  isManager,
  onEditShift,
  onAddShift,
  onDeleteShift
}) => {
  if (!isManager) {
    return <>{children}</>;
  }

  const dateSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return format(scheduleDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-gray-700">
          {format(date, 'EEEE, MMMM d')}
        </div>
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={() => onAddShift(date)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add new shift
        </ContextMenuItem>

        {dateSchedules.length > 0 && (
          <>
            <ContextMenuSeparator />
            {dateSchedules.map((schedule) => (
              <div key={schedule.id}>
                <div className="px-2 py-1 text-xs text-gray-500">
                  {schedule.title} - {format(new Date(schedule.start_time), 'HH:mm')}
                </div>
                <ContextMenuItem 
                  onClick={() => onEditShift(schedule)}
                  className="flex items-center gap-2 ml-4"
                  disabled={!schedule.can_be_edited && !schedule.is_draft}
                >
                  <Edit className="h-4 w-4" />
                  Edit shift
                </ContextMenuItem>
                <ContextMenuItem 
                  onClick={() => onDeleteShift(schedule)}
                  className="flex items-center gap-2 ml-4 text-red-600"
                  disabled={schedule.published && !schedule.is_draft}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete shift
                </ContextMenuItem>
              </div>
            ))}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ScheduleDateContextMenu;
