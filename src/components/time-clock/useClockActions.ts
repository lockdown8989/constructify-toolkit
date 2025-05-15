
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClockActions = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [action, setAction] = useState<'in' | 'out' | null>(null);
  const [showPinEntry, setShowPinEntry] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSelectEmployee = (employeeId: string, employeeName: string) => {
    setSelectedEmployee(employeeId);
    setSelectedEmployeeName(employeeName);
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
    setShowPinEntry(true);
  };

  const handlePinSubmit = async (pin: string) => {
    // In a real system, this would verify the PIN against a secure database
    // For this demo, we're just checking if the PIN has 4 digits
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a valid 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      if (action === 'in') {
        // Check if there's already an active session for today
        const { data: existingRecord } = await supabase
          .from('attendance')
          .select('id, active_session')
          .eq('employee_id', selectedEmployee)
          .eq('date', today)
          .eq('active_session', true)
          .maybeSingle();
          
        if (existingRecord?.active_session) {
          toast({
            title: "Already clocked in",
            description: `${selectedEmployeeName} is already clocked in for today`,
            variant: "destructive",
          });
          setShowPinEntry(false);
          return;
        }
        
        // Clock in - Create a new record without using upsert
        const { error } = await supabase
          .from('attendance')
          .insert({
            employee_id: selectedEmployee,
            date: today,
            check_in: now.toISOString(),
            active_session: true,
            attendance_status: 'Present',
            device_info: 'Manager Dashboard',
            notes: 'Clocked in via manager dashboard with PIN'
          });
          
        if (error) throw error;
        
        toast({
          title: "Clocked In",
          description: `${selectedEmployeeName} clocked in at ${format(now, 'h:mm a')}`,
        });
      } else {
        // Find active session
        const { data: activeSession } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', selectedEmployee)
          .eq('active_session', true)
          .maybeSingle();
          
        if (!activeSession) {
          toast({
            title: "No active session",
            description: `${selectedEmployeeName} is not clocked in`,
            variant: "destructive",
          });
          setShowPinEntry(false);
          return;
        }
        
        // Calculate working minutes
        const checkInTime = new Date(activeSession.check_in);
        const workingMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
        
        // Clock out
        const { error } = await supabase
          .from('attendance')
          .update({
            check_out: now.toISOString(),
            active_session: false,
            working_minutes: workingMinutes,
            overtime_minutes: Math.max(0, workingMinutes - 480) // Over 8 hours
          })
          .eq('id', activeSession.id);
          
        if (error) throw error;
        
        toast({
          title: "Clocked Out",
          description: `${selectedEmployeeName} clocked out at ${format(now, 'h:mm a')}`,
        });
      }

      // Reset state
      setTimeout(() => {
        setSelectedEmployee(null);
        setSelectedEmployeeName('');
        setAction(null);
        setShowPinEntry(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error with clock action:', error);
      toast({
        title: "Error",
        description: "There was an error processing the clock action",
        variant: "destructive",
      });
      setShowPinEntry(false);
    }
  };

  const handleCancelPin = () => {
    setShowPinEntry(false);
    setAction(null);
  };

  return {
    selectedEmployee,
    selectedEmployeeName,
    action,
    showPinEntry,
    handleSelectEmployee,
    handleClockAction,
    handlePinSubmit,
    handleCancelPin,
    setSelectedEmployee,
    setAction
  };
};
