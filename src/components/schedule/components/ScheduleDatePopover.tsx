
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, MapPin, User } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { Badge } from '@/components/ui/badge';

interface ScheduleDatePopoverProps {
  children: React.ReactNode;
  date: Date;
  schedules: Schedule[];
  employeeNames: Record<string, string>;
}

const ScheduleDatePopover: React.FC<ScheduleDatePopoverProps> = ({
  children,
  date,
  schedules,
  employeeNames
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dateSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return format(scheduleDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });

  if (dateSchedules.length === 0) {
    return <>{children}</>;
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-3"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="space-y-3">
          <div className="font-medium text-sm text-gray-900">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </div>
          
          {dateSchedules.map((schedule) => (
            <div key={schedule.id} className="border-l-2 border-blue-200 pl-3 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{schedule.title}</h4>
                {schedule.is_draft && (
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(schedule.start_time), 'HH:mm')} - {format(new Date(schedule.end_time), 'HH:mm')}
                </span>
              </div>
              
              {schedule.employee_id && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <User className="h-3 w-3" />
                  <span>{employeeNames[schedule.employee_id] || 'Unknown Employee'}</span>
                </div>
              )}
              
              {schedule.location && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>{schedule.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getStatusColor(schedule.status)}`}>
                  {schedule.status || 'confirmed'}
                </Badge>
              </div>
              
              {schedule.notes && (
                <div className="text-xs text-gray-500 italic">
                  {schedule.notes}
                </div>
              )}
            </div>
          ))}
          
          <div className="text-xs text-gray-500 pt-2 border-t">
            Right-click for quick actions
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ScheduleDatePopover;
