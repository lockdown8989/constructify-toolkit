
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, Users, Calendar, CalendarCheck } from 'lucide-react';
import { ShiftPattern } from '@/types/shift-patterns';

interface Employee {
  id: string;
  name: string;
}

interface RotaPatternCardProps {
  pattern: ShiftPattern;
  assignedEmployees: Employee[];
  onEdit: (pattern: ShiftPattern) => void;
  onDelete: (id: string) => void;
  onSyncToCalendar: (patternId: string) => void;
  isSyncing: boolean;
}

export const RotaPatternCard: React.FC<RotaPatternCardProps> = ({
  pattern,
  assignedEmployees,
  onEdit,
  onDelete,
  onSyncToCalendar,
  isSyncing
}) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{pattern.name}</h3>
                <p className="text-sm text-gray-600">
                  {pattern.start_time} - {pattern.end_time}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Break: {pattern.break_duration}min</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Grace: {pattern.grace_period_minutes}min
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  OT: {pattern.overtime_threshold_minutes}min
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {assignedEmployees.length} employee{assignedEmployees.length !== 1 ? 's' : ''} assigned
              </span>
              {assignedEmployees.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-2">
                  {assignedEmployees.slice(0, 3).map((employee) => (
                    <Badge key={employee.id} variant="secondary" className="text-xs">
                      {employee.name}
                    </Badge>
                  ))}
                  {assignedEmployees.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{assignedEmployees.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSyncToCalendar(pattern.id)}
              disabled={isSyncing || assignedEmployees.length === 0}
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <CalendarCheck className="h-4 w-4" />
                  Sync to Calendar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(pattern)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(pattern.id)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
