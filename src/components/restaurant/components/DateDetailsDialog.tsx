
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { OpenShiftType } from '@/types/supabase/schedules';
import { Clock, User, MapPin, FileText, Calendar, AlertCircle } from 'lucide-react';

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

  // Get shifts for selected date - improved logic
  const getShiftsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEEE').toLowerCase();
    
    return shifts.filter(shift => {
      // Check if shift has a date field or match by day name
      if (shift.day) {
        return shift.day.toLowerCase() === dayName;
      }
      return false;
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

  const dayShifts = getShiftsForDate(selectedDate);
  const dayOpenShifts = getOpenShiftsForDate(selectedDate);
  
  // Calculate totals
  const totalShifts = dayShifts.length + dayOpenShifts.length;
  const totalHours = dayShifts.reduce((sum, shift) => {
    const start = new Date(`2000-01-01T${shift.startTime}`);
    const end = new Date(`2000-01-01T${shift.endTime}`);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalShifts}</div>
            <div className="text-sm text-gray-600">Total Shifts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{dayShifts.length}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{dayOpenShifts.length}</div>
            <div className="text-sm text-gray-600">Open Shifts</div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Regular Shifts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Scheduled Shifts ({dayShifts.length})</h3>
            </div>
            
            {dayShifts.length > 0 ? (
              <div className="space-y-3">
                {dayShifts.map((shift) => {
                  const employee = employees.find(emp => emp.id === shift.employeeId);
                  const isRotaShift = shift.role?.toLowerCase().includes('rota');
                  
                  return (
                    <div key={shift.id} className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: employee?.color || '#6B7280' }}
                            />
                            <span className="font-medium text-gray-900">
                              {employee?.name || 'Unknown Employee'}
                            </span>
                            <Badge variant={shift.status === 'confirmed' ? 'default' : 'secondary'}>
                              {shift.status || 'pending'}
                            </Badge>
                            {isRotaShift && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Calendar className="h-3 w-3 mr-1" />
                                Rota
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{shift.startTime} - {shift.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{shift.role}</span>
                            </div>
                          </div>
                          
                          {shift.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              <strong>Notes:</strong> {shift.notes}
                            </div>
                          )}
                          
                          {isRotaShift && (
                            <div className="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-700 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              <span>Auto-confirmed rota shift - Employee must clock in/out</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No scheduled shifts for this date</p>
              </div>
            )}
          </div>

          {/* Open Shifts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Open Shifts ({dayOpenShifts.length})</h3>
            </div>
            
            {dayOpenShifts.length > 0 ? (
              <div className="space-y-3">
                {dayOpenShifts.map((openShift) => (
                  <div key={openShift.id} className="p-4 border rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">{openShift.title}</span>
                          <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-100">
                            {openShift.status}
                          </Badge>
                          {openShift.priority && openShift.priority !== 'normal' && (
                            <Badge variant={openShift.priority === 'high' ? 'destructive' : 'secondary'}>
                              {openShift.priority} priority
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(openShift.start_time), 'HH:mm')} - 
                              {format(new Date(openShift.end_time), 'HH:mm')}
                            </span>
                          </div>
                          {openShift.role && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{openShift.role}</span>
                            </div>
                          )}
                        </div>
                        
                        {openShift.location && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{openShift.location}</span>
                          </div>
                        )}
                        
                        {openShift.notes && (
                          <div className="mt-2 p-2 bg-white rounded text-sm text-gray-600">
                            <strong>Notes:</strong> {openShift.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No open shifts for this date</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateDetailsDialog;
