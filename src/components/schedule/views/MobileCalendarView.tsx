
import React from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// The proper handler interface 
interface ShiftSubmitters {
  handleAddShiftSubmit: (formData: any) => void;
  handleEmployeeShiftSubmit: (formData: any) => void;
  handleSwapShiftSubmit: (formData: any) => void;
  handleAddShiftClose: () => void;
  handleEmployeeShiftClose: () => void;
  handleSwapShiftClose: () => void;
  handleEmployeeAddShift: (employeeId: string, date: Date) => void;
}

// Update the component props to match
interface MobileCalendarViewProps {
  shiftState: any;
  handleSubmitters: ShiftSubmitters;
}

const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({ shiftState, handleSubmitters }) => {
  const { visibleDays, allEmployeeSchedules, handleNextPeriod, handlePreviousPeriod, handleAddShift } = shiftState;
  
  console.log('MobileCalendarView rendered', { 
    visibleDaysCount: visibleDays?.length,
    employeesCount: allEmployeeSchedules?.length,
    handlersAvailable: !!handleSubmitters
  });
  
  return (
    <div className="p-4">
      {/* Mobile calendar header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePreviousPeriod} className="p-2">
          &lt; Prev
        </button>
        <h2 className="font-bold">{visibleDays.length > 0 && format(visibleDays[0], 'MMMM yyyy')}</h2>
        <button onClick={handleNextPeriod} className="p-2">
          Next &gt;
        </button>
      </div>
      
      {/* Mobile calendar days */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {visibleDays.map((day, i) => (
          <div 
            key={i} 
            className={cn(
              "flex flex-col items-center p-1 text-sm",
              isToday(day) && "bg-blue-100 rounded-full"
            )}
            onClick={() => handleAddShift(day)}
          >
            <span>{format(day, 'EEE')}</span>
            <span className="font-bold">{format(day, 'd')}</span>
          </div>
        ))}
      </div>
      
      {/* Mobile employee list */}
      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shifts">
          <div className="space-y-2 mt-2">
            {allEmployeeSchedules.length > 0 ? (
              allEmployeeSchedules.map((empSchedule: any, i: number) => (
                <div key={i} className="p-3 border rounded-lg">
                  <h3 className="font-medium">{empSchedule.employeeName || 'Unknown Employee'}</h3>
                  <div className="mt-1 space-y-1">
                    {empSchedule.shifts.map((shift: any, j: number) => (
                      <div 
                        key={j} 
                        className="bg-gray-50 p-2 rounded text-sm"
                        onClick={() => handleSubmitters.handleEmployeeAddShift(empSchedule.employeeId, new Date(shift.start_time))}
                      >
                        {format(new Date(shift.start_time), 'ha')} - {format(new Date(shift.end_time), 'ha')}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No shifts scheduled</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="employees">
          <div className="space-y-2 mt-2">
            {allEmployeeSchedules.map((empSchedule: any, i: number) => (
              <div key={i} className="p-3 border rounded-lg">
                <h3 className="font-medium">{empSchedule.employeeName || 'Unknown Employee'}</h3>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileCalendarView;
