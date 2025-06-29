
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Clock, MapPin, User, FileText } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { OpenShiftType } from '@/types/supabase/schedules';

interface DateDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  schedules: Schedule[];
  openShifts: OpenShiftType[];
  employeeNames: Record<string, string>;
}

const DateDetailsDialog: React.FC<DateDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDate,
  schedules,
  openShifts,
  employeeNames
}) => {
  if (!selectedDate) return null;

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Get schedules for the selected date
  const daySchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return format(scheduleDate, 'yyyy-MM-dd') === dateString;
  });

  // Get open shifts for the selected date
  const dayOpenShifts = openShifts.filter(shift => {
    const shiftDate = new Date(shift.start_time);
    return format(shiftDate, 'yyyy-MM-dd') === dateString;
  });

  const totalItems = daySchedules.length + dayOpenShifts.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {totalItems === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No shifts scheduled for this day</p>
            </div>
          ) : (
            <>
              {/* Assigned Shifts */}
              {daySchedules.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Assigned Shifts ({daySchedules.length})
                  </h3>
                  <div className="space-y-3">
                    {daySchedules.map(schedule => (
                      <Card key={schedule.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">
                                {employeeNames[schedule.employee_id] || 'Unknown Employee'}
                              </span>
                            </div>
                            <Badge 
                              variant={
                                schedule.status === 'pending' ? 'outline' : 
                                schedule.status === 'employee_accepted' ? 'default' : 
                                'destructive'
                              }
                              className={
                                schedule.status === 'pending' 
                                  ? 'border-orange-300 text-orange-700 bg-orange-50' 
                                  : schedule.status === 'employee_accepted' 
                                    ? 'border-green-300 text-green-700 bg-green-50'
                                    : 'border-red-300 text-red-700 bg-red-50'
                              }
                            >
                              {schedule.status === 'employee_accepted' ? 'Accepted' : 
                               schedule.status === 'employee_rejected' ? 'Rejected' : 
                               schedule.status === 'pending' ? 'Pending' : schedule.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(schedule.start_time), 'h:mm a')} - 
                                {format(new Date(schedule.end_time), 'h:mm a')}
                              </span>
                            </div>
                            
                            {schedule.title && schedule.title !== 'Regular Shift' && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                <span>{schedule.title}</span>
                              </div>
                            )}
                            
                            {schedule.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                            
                            {schedule.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                <strong>Notes:</strong> {schedule.notes}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Shifts */}
              {dayOpenShifts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Open Shifts ({dayOpenShifts.length})
                  </h3>
                  <div className="space-y-3">
                    {dayOpenShifts.map(shift => (
                      <Card key={shift.id} className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-sm">{shift.title}</span>
                            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                              Open
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(shift.start_time), 'h:mm a')} - 
                                {format(new Date(shift.end_time), 'h:mm a')}
                              </span>
                            </div>
                            
                            {shift.role && (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span>{shift.role}</span>
                              </div>
                            )}
                            
                            {shift.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>{shift.location}</span>
                              </div>
                            )}
                            
                            {shift.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                <strong>Notes:</strong> {shift.notes}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateDetailsDialog;
