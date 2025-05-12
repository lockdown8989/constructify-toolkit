
import React from 'react';
import { format } from 'date-fns';
import { OpenShiftType } from '@/types/supabase/schedules';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

interface OpenShiftsListProps {
  openShifts: OpenShiftType[];
  onShiftDragStart: (e: React.DragEvent, shift: OpenShiftType) => void;
  onShiftDragEnd: () => void;
}

const OpenShiftsList: React.FC<OpenShiftsListProps> = ({
  openShifts,
  onShiftDragStart,
  onShiftDragEnd
}) => {
  if (openShifts.length === 0) {
    return (
      <div className="p-3 text-center text-sm text-muted-foreground">
        No open shifts available
      </div>
    );
  }

  return (
    <div className="space-y-2 px-2 py-1">
      {openShifts.map(shift => (
        <Card
          key={shift.id}
          draggable
          onDragStart={(e) => onShiftDragStart(e, shift)}
          onDragEnd={onShiftDragEnd}
          className="p-3 cursor-move hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium">{shift.title}</h4>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(shift.start_time), 'MMM d, h:mm a')} - 
                {format(new Date(shift.end_time), 'h:mm a')}
              </div>
              {shift.location && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {shift.location}
                </div>
              )}
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {shift.role || 'General'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {shift.notes || 'No additional notes'}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OpenShiftsList;
