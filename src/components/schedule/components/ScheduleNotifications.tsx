
import React from 'react';
import { Bell, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Schedule } from '@/hooks/use-schedules';
import { format } from 'date-fns';

interface ScheduleNotificationsProps {
  newSchedules: Schedule[];
  pendingSchedules: Schedule[];
}

const ScheduleNotifications: React.FC<ScheduleNotificationsProps> = ({
  newSchedules,
  pendingSchedules
}) => {
  if (pendingSchedules.length === 0 && newSchedules.length === 0) {
    return null;
  }

  return (
    <>
      {pendingSchedules.length > 0 && (
        <Card className="mb-4 p-3 bg-amber-50 border-amber-200">
          <div className="flex items-start">
            <Clock className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700">
                You have {pendingSchedules.length} pending shift{pendingSchedules.length > 1 ? 's' : ''} waiting for response
              </p>
              <ul className="mt-1 space-y-1">
                {pendingSchedules.slice(0, 3).map(schedule => (
                  <li key={schedule.id} className="text-xs text-amber-600">
                    <span className="font-medium">{schedule.title}</span> on {format(new Date(schedule.start_time), 'EEE, MMM d')}
                  </li>
                ))}
                {pendingSchedules.length > 3 && (
                  <li className="text-xs text-amber-600">
                    <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                      +{pendingSchedules.length - 3} more
                    </Badge>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
      
      {newSchedules.length > 0 && !pendingSchedules.some(p => newSchedules.find(n => n.id === p.id)) && (
        <Card className="mb-4 p-3 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <Bell className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700">
                You have {newSchedules.length} new shift{newSchedules.length > 1 ? 's' : ''}
              </p>
              <ul className="mt-1 space-y-1">
                {newSchedules.slice(0, 3).map(schedule => (
                  <li key={schedule.id} className="text-xs text-blue-600">
                    <span className="font-medium">{schedule.title}</span> on {format(new Date(schedule.start_time), 'EEE, MMM d')}
                  </li>
                ))}
                {newSchedules.length > 3 && (
                  <li className="text-xs text-blue-600">
                    <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                      +{newSchedules.length - 3} more
                    </Badge>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ScheduleNotifications;
