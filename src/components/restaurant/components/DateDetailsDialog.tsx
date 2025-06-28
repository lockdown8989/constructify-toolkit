
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { OpenShiftType } from '@/types/supabase/schedules';

interface DateDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  shifts: Shift[];
  openShifts: OpenShiftType[];
  employees: Employee[];
}

const DateDetailsDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  shifts,
  openShifts,
  employees
}: DateDetailsDialogProps) => {
  if (!selectedDate) return null;

  // Get shifts for selected date
  const getShiftsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return shifts.filter(shift => {
      // Compare by day name or date
      const shiftDay = shift.day.toLowerCase();
      const selectedDay = format(date, 'EEEE').toLowerCase();
      return shiftDay === selectedDay;
    });
  };
  
  // Get open shifts for selected date
  const getOpenShiftsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return openShifts.filter(openShift => {
      const shiftDate = format(new Date(openShift.start_time), 'yyyy-MM-dd');
      return shiftDate === dateString;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Schedule Details - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Regular Shifts */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Scheduled Shifts</h3>
            {getShiftsForDate(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getShiftsForDate(selectedDate).map((shift) => {
                  const employee = employees.find(emp => emp.id === shift.employeeId);
                  return (
                    <div key={shift.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{employee?.name || 'Unknown Employee'}</div>
                          <div className="text-sm text-gray-600">{shift.role}</div>
                          <div className="text-sm text-gray-500">
                            {shift.startTime} - {shift.endTime}
                          </div>
                        </div>
                        <Badge variant={shift.status === 'confirmed' ? 'default' : 'secondary'}>
                          {shift.status}
                        </Badge>
                      </div>
                      {shift.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          Notes: {shift.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No scheduled shifts for this date.</p>
            )}
          </div>

          {/* Open Shifts */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Open Shifts</h3>
            {getOpenShiftsForDate(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getOpenShiftsForDate(selectedDate).map((openShift) => (
                  <div key={openShift.id} className="p-3 border rounded-lg bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{openShift.title}</div>
                        <div className="text-sm text-gray-600">{openShift.role}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(openShift.start_time), 'HH:mm')} - {format(new Date(openShift.end_time), 'HH:mm')}
                        </div>
                      </div>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        Open
                      </Badge>
                    </div>
                    {openShift.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        Notes: {openShift.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No open shifts for this date.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateDetailsDialog;
