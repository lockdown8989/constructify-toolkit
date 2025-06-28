
import { useMemo, useState } from 'react';
import { useRestaurantSchedule } from '@/hooks/use-restaurant-schedule';
import { Shift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useShiftUtilities } from '@/components/restaurant/ShiftUtilities';
import { formatCurrency } from '@/components/restaurant/utils/schedule-utils';
import { toast as sonnerToast } from 'sonner';
import { OpenShiftType } from '@/types/supabase/schedules';
import RestaurantScheduleHeader from './RestaurantScheduleHeader';
import RestaurantScheduleGrid from './RestaurantScheduleGrid';
import RestaurantScheduleRoles from './RestaurantScheduleRoles';
import RestaurantScheduleLoading from './RestaurantScheduleLoading';
import RestaurantScheduleError from './RestaurantScheduleError';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const RestaurantScheduleContent = () => {
  console.log('RestaurantScheduleContent component rendering...');
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  
  try {
    const { 
      employees,
      shifts,
      openShifts,
      weekStats,
      addShift,
      updateShift,
      removeShift,
      addOpenShift,
      assignOpenShift,
      previousWeek,
      nextWeek,
      viewMode,
      setViewMode,
      isLoading: scheduleLoading
    } = useRestaurantSchedule();
    
    console.log('RestaurantScheduleContent hooks loaded successfully', { 
      employeesCount: employees?.length, 
      shiftsCount: shifts?.length,
      scheduleLoading 
    });
    
    const { allEmployees, isLoading: isLoadingEmployeeData, error } = useEmployeeDataManagement();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { handleAddNote, handleAddBreak } = useShiftUtilities(updateShift);
    
    // Use the employees from the restaurant schedule hook, but fall back to raw data if needed
    const finalEmployees = employees && employees.length > 0 ? employees : [];
    
    console.log('Final employees being used:', finalEmployees);
    console.log('Employee data from management hook:', allEmployees);
    console.log('Error from employee data:', error);
    
    // Create a proper WeekStats object with all required properties
    const enhancedWeekStats = useMemo(() => {
      if (!weekStats) {
        return {
          weekRange: 'Current Week',
          startDate: new Date(),
          endDate: new Date(),
          totalHours: 0,
          totalCost: 0,
          dailyHours: {
            monday: 0, tuesday: 0, wednesday: 0, thursday: 0, 
            friday: 0, saturday: 0, sunday: 0
          },
          dailyCosts: {
            monday: 0, tuesday: 0, wednesday: 0, thursday: 0, 
            friday: 0, saturday: 0, sunday: 0
          },
          roles: [],
          openShiftsTotalHours: 0,
          openShiftsTotalCount: 0
        };
      }
      
      return {
        weekRange: weekStats.weekRange,
        startDate: weekStats.startDate || new Date(),
        endDate: weekStats.endDate || new Date(),
        totalHours: weekStats.totalHours,
        totalCost: weekStats.totalCost,
        dailyHours: weekStats.dailyHours,
        dailyCosts: weekStats.dailyCosts,
        roles: weekStats.roles,
        openShiftsTotalHours: weekStats.openShiftsTotalHours || 0,
        openShiftsTotalCount: weekStats.openShiftsTotalCount || 0
      };
    }, [weekStats]);
    
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
    
    // Handle date click
    const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      setIsDateDialogOpen(true);
    };
    
    // Organize shifts by employee and day for the role sections
    const organizedShifts = useMemo(() => {
      const result: Record<string, Record<string, Shift[]>> = {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      // Initialize the structure
      finalEmployees.forEach(employee => {
        result[employee.id] = {};
        days.forEach(day => {
          result[employee.id][day] = [];
        });
      });
      
      // Populate with shifts
      shifts.forEach(shift => {
        if (result[shift.employeeId] && result[shift.employeeId][shift.day]) {
          result[shift.employeeId][shift.day].push(shift);
        }
      });
      
      return result;
    }, [finalEmployees, shifts]);
    
    // Handle assigning an open shift
    const handleAssignOpenShift = (openShiftId: string, employeeId?: string) => {
      if (employeeId) {
        // Direct assignment from drag and drop
        assignOpenShift(openShiftId, employeeId);
        
        sonnerToast.success("Shift assigned", {
          description: "The shift has been successfully assigned to the employee."
        });
      } else {
        // Show assignment dialog (future feature)
        toast({
          title: "Feature coming soon",
          description: "The ability to assign open shifts will be available soon.",
        });
      }
    };

    // Handle adding open shift with proper type conversion
    const handleAddOpenShift = (openShift: Omit<OpenShiftType, 'id'>) => {
      addOpenShift(openShift);
    };
    
    if (isLoadingEmployeeData || scheduleLoading) {
      console.log('Loading data...');
      return <RestaurantScheduleLoading />;
    }

    if (error) {
      console.error('Error loading employee data:', error);
      return <RestaurantScheduleError />;
    }
    
    console.log('RestaurantScheduleContent rendering main content');
    
    return (
      <div className="container py-6 sm:py-8 max-w-[1400px] px-3 md:px-6 mx-auto">
        <RestaurantScheduleHeader 
          setViewMode={(mode) => setViewMode(mode as 'week' | 'day')}
        />
        
        <RestaurantScheduleGrid
          employees={finalEmployees}
          weekStats={enhancedWeekStats}
          openShifts={openShifts as OpenShiftType[]}
          formatCurrency={formatCurrency}
          handleAssignOpenShift={handleAssignOpenShift}
          previousWeek={previousWeek}
          nextWeek={nextWeek}
          isMobile={isMobile}
          addOpenShift={handleAddOpenShift}
          addShift={addShift}
          updateShift={updateShift}
          removeShift={removeShift}
          onDateClick={handleDateClick}
        />
        
        <RestaurantScheduleRoles
          weekStats={enhancedWeekStats}
          organizedShifts={organizedShifts}
          removeShift={removeShift}
          handleAddNote={handleAddNote}
          handleAddBreak={handleAddBreak}
          isMobile={isMobile}
          addShift={addShift}
          updateShift={updateShift}
        />

        {/* Date Details Dialog */}
        <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Schedule Details - {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedDate && (
              <div className="space-y-6">
                {/* Regular Shifts */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Scheduled Shifts</h3>
                  {getShiftsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-2">
                      {getShiftsForDate(selectedDate).map((shift) => {
                        const employee = finalEmployees.find(emp => emp.id === shift.employeeId);
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
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  } catch (error) {
    console.error('Error in RestaurantScheduleContent component:', error);
    return <RestaurantScheduleError />;
  }
};

export default RestaurantScheduleContent;
