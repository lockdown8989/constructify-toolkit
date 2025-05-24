
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDeviceIdentifier } from '@/hooks/time-clock/utils/device-utils';

export const useClockActions = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [action, setAction] = useState<'in' | 'out' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setAction(null);
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

    if (isProcessing) {
      toast({
        title: "Processing in progress",
        description: "Please wait while we process your request",
        variant: "default",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setAction(clockAction);
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const deviceIdentifier = getDeviceIdentifier();
      const deviceInfo = `Manager Dashboard - ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
      
      console.log(`Manager ${clockAction} action at (local):`, now.toLocaleString());
      console.log(`Manager ${clockAction} action at (ISO):`, now.toISOString());
      
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
          throw new Error('Failed to check for active sessions');
        }
          
        if (existingRecord?.active_session) {
          toast({
            title: "Already clocked in",
            description: "This employee is already clocked in for today",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        // Clock in - create a new record with manager_initiated=true
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: selectedEmployee,
            date: today,
            check_in: now.toISOString(),
            active_session: true,
            attendance_status: 'Present',
            device_info: deviceInfo,
            device_identifier: deviceIdentifier,
            notes: 'Clocked in by manager',
            status: 'Present',
            manager_initiated: true
          })
          .select();
          
        if (error) {
          console.error('Error clocking in:', error);
          throw new Error('Failed to clock in: ' + error.message);
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
          .eq('date', today)
          .eq('active_session', true)
          .maybeSingle();
          
        if (findError) {
          console.error('Error finding active session:', findError);
          throw new Error('Failed to find active session');
        }
          
        if (!activeSession) {
          toast({
            title: "No active session",
            description: "This employee is not clocked in",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        // Calculate working minutes
        const checkInTime = new Date(activeSession.check_in);
        const workingMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
        const overtimeMinutes = Math.max(0, workingMinutes - 480);
        
        // Clock out
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            check_out: now.toISOString(),
            active_session: false,
            working_minutes: workingMinutes - overtimeMinutes,
            overtime_minutes: overtimeMinutes,
            device_info: deviceInfo,
            device_identifier: deviceIdentifier,
            status: 'Present',
            manager_initiated: true
          })
          .eq('id', activeSession.id);
          
        if (updateError) {
          console.error('Error clocking out:', updateError);
          throw new Error('Failed to clock out: ' + updateError.message);
        }
        
        toast({
          title: "Clocked Out",
          description: `Employee clocked out at ${format(now, 'h:mm a')}`,
        });
      }

      setTimeout(() => {
        setAction(null);
        setIsProcessing(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error with clock action:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing the clock action",
        variant: "destructive",
      });
      setAction(null);
      setIsProcessing(false);
      throw error;
    }
  };

  const handleBreakAction = async (breakAction: 'start' | 'end') => {
    if (!selectedEmployee) {
      toast({
        title: "No employee selected",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const deviceInfo = `Manager Dashboard - ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
      
      // Find active session
      const { data: activeSession, error: findError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', selectedEmployee)
        .eq('date', today)
        .eq('active_session', true)
        .maybeSingle();
        
      if (findError) {
        console.error('Error finding active session:', findError);
        throw new Error('Failed to find active session');
      }
        
      if (!activeSession) {
        toast({
          title: "No active session",
          description: "This employee is not clocked in",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (breakAction === 'start') {
        // Start break
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            break_start: now.toISOString(),
            device_info: deviceInfo,
            notes: (activeSession.notes || '') + ` | Break started by manager at ${format(now, 'h:mm a')}`
          })
          .eq('id', activeSession.id);
          
        if (updateError) {
          console.error('Error starting break:', updateError);
          throw new Error('Failed to start break: ' + updateError.message);
        }
        
        toast({
          title: "Break Started",
          description: `Employee started break at ${format(now, 'h:mm a')}`,
        });
      }

      setTimeout(() => {
        setAction(null);
        setIsProcessing(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error with break action:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing the break action",
        variant: "destructive",
      });
      setAction(null);
      setIsProcessing(false);
      throw error;
    }
  };

  return {
    selectedEmployee,
    action,
    isProcessing,
    handleSelectEmployee,
    handleClockAction,
    handleBreakAction,
    setSelectedEmployee,
    setAction
  };
};
