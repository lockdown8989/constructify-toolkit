
import { useMemo } from 'react';
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

const RestaurantScheduleContent = () => {
  console.log('RestaurantScheduleContent component rendering...');
  
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
    
    const { employeeData, isLoading: isLoadingEmployeeData, error } = useEmployeeDataManagement();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { handleAddNote, handleAddBreak } = useShiftUtilities(updateShift);
    
    // Use the employees from the restaurant schedule hook, but fall back to raw data if needed
    const finalEmployees = employees && employees.length > 0 ? employees : [];
    
    console.log('Final employees being used:', finalEmployees);
    console.log('Employee data from management hook:', employeeData);
    console.log('Error from employee data:', error);
    
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
          weekStats={weekStats}
          openShifts={openShifts as OpenShiftType[]}
          formatCurrency={formatCurrency}
          handleAssignOpenShift={handleAssignOpenShift}
          previousWeek={previousWeek}
          nextWeek={nextWeek}
          isMobile={isMobile}
          addOpenShift={addOpenShift}
          addShift={addShift}
          updateShift={updateShift}
          removeShift={removeShift}
        />
        
        <RestaurantScheduleRoles
          weekStats={weekStats}
          organizedShifts={organizedShifts}
          removeShift={removeShift}
          handleAddNote={handleAddNote}
          handleAddBreak={handleAddBreak}
          isMobile={isMobile}
          addShift={addShift}
          updateShift={updateShift}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in RestaurantScheduleContent component:', error);
    return <RestaurantScheduleError />;
  }
};

export default RestaurantScheduleContent;
