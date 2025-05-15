
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClockActions = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [action, setAction] = useState<'in' | 'out' | null>(null);
  const { toast } = useToast();

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const handleClockAction = async (clockAction: 'in' | 'out') => {
    if (!selectedEmployee) {
      toast({
        title: "No employee selected",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }

    setAction(clockAction);
    
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      if (clockAction === 'in') {
        // Check if there's already an active session for today
        const { data: existingRecord, error: checkError } = await supabase
          .from('attendance')
          .select('id, active_session')
          .eq('employee_id', selectedEmployee)
          .eq('date', today)
          .eq('active_session', true)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking for existing active session:', checkError);
          throw checkError;
        }
          
        if (existingRecord?.active_session) {
          toast({
            title: "Already clocked in",
            description: "This employee is already clocked in for today",
            variant: "destructive",
          });
          return;
        }
        
        // Clock in - create a new record or update existing non-active one
        const { data, error } = await supabase
          .from('attendance')
          .upsert({
            employee_id: selectedEmployee,
            date: today,
            check_in: now.toISOString(),
            active_session: true,
            attendance_status: 'Present',
            device_info: 'Manager Dashboard',
            notes: 'Clocked in by manager',
            status: 'Present'
          }, {
            onConflict: 'employee_id,date'
          })
          .select();
          
        if (error) {
          console.error('Error clocking in:', error);
          throw error;
        }
        
        toast({
          title: "Clocked In",
          description: `Employee clocked in at ${format(now, 'h:mm a')}`,
        });
      } else {
        // Find active session
        const { data: activeSession, error: findError } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', selectedEmployee)
          .eq('active_session', true)
          .maybeSingle();
          
        if (findError) {
          console.error('Error finding active session:', findError);
          throw findError;
        }
          
        if (!activeSession) {
          toast({
            title: "No active session",
            description: "This employee is not clocked in",
            variant: "destructive",
          });
          return;
        }
        
        // Calculate working minutes
        const checkInTime = new Date(activeSession.check_in);
        const workingMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
        
        // Clock out
        const { data, error: updateError } = await supabase
          .from('attendance')
          .update({
            check_out: now.toISOString(),
            active_session: false,
            working_minutes: workingMinutes,
            overtime_minutes: Math.max(0, workingMinutes - 480) // Over 8 hours
          })
          .eq('id', activeSession.id)
          .select();
          
        if (updateError) {
          console.error('Error clocking out:', updateError);
          throw updateError;
        }
        
        toast({
          title: "Clocked Out",
          description: `Employee clocked out at ${format(now, 'h:mm a')}`,
        });
      }

      // Reset state
      setTimeout(() => {
        setSelectedEmployee(null);
        setAction(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error with clock action:', error);
      toast({
        title: "Error",
        description: "There was an error processing the clock action",
        variant: "destructive",
      });
      throw error; // Rethrow to allow handling in the component
    }
  };

  return {
    selectedEmployee,
    action,
    handleSelectEmployee,
    handleClockAction,
    setSelectedEmployee,
    setAction
  };
};
