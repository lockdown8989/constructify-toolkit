
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { AttendanceRecord } from '@/types/supabase/attendance';

type TimeClockStatus = 'clocked-in' | 'clocked-out' | 'on-break';

export const useTimeClock = () => {
  const [status, setStatus] = useState<TimeClockStatus>('clocked-out');
  const [currentRecord, setCurrentRecord] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { employeeData } = useEmployeeDataManagement();

  // Auto-clockout function when user logs out
  const performAutoClockout = async (employeeId: string, recordId: string) => {
    console.log('Performing auto-clockout for employee:', employeeId, 'record:', recordId);
    
    const now = new Date();
    
    // Check if the user is on break
    const { data: record } = await supabase
      .from('attendance')
      .select('break_start')
      .eq('id', recordId)
      .single();
      
    // If on break, calculate break minutes
    if (record?.break_start) {
      const breakStart = new Date(record.break_start);
      const breakMinutes = Math.round((now.getTime() - breakStart.getTime()) / (1000 * 60));
      
      // Update the record with break minutes and clock out
      await supabase
        .from('attendance')
        .update({
          break_minutes: breakMinutes,
          break_start: null,
          check_out: now.toISOString(),
          status: 'Auto-logout'
        })
        .eq('id', recordId);
    } else {
      // Just clock out
      await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          status: 'Auto-logout'
        })
        .eq('id', recordId);
    }
    
    // Reset local state
    setCurrentRecord(null);
    setStatus('clocked-out');
  };

  // Check current status on load
  useEffect(() => {
    if (!employeeData?.id) return;

    const checkCurrentStatus = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: records } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeData.id)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      if (records && records.length > 0) {
        const record = records[0] as AttendanceRecord;
        setCurrentRecord(record.id);
        
        if (!record.check_out) {
          setStatus(record.break_minutes && record.break_minutes > 0 ? 'on-break' : 'clocked-in');
        } else {
          setStatus('clocked-out');
        }
      }
    };

    checkCurrentStatus();
  }, [employeeData?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!employeeData?.id) return;

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `employee_id=eq.${employeeData.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.new) {
            const record = payload.new as AttendanceRecord;
            setCurrentRecord(record.id);
            
            if (!record.check_out) {
              setStatus(record.break_minutes && record.break_minutes > 0 ? 'on-break' : 'clocked-in');
            } else {
              setStatus('clocked-out');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeData?.id]);

  // Handle auto-clockout when user logs out
  useEffect(() => {
    // Only do something if the user was logged in (has employeeData) but now is logged out
    if (!isAuthenticated && currentRecord && employeeData?.id) {
      performAutoClockout(employeeData.id, currentRecord);
    }
  }, [isAuthenticated, currentRecord, employeeData?.id]);

  // Additional auth state monitoring for logout situations
  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      // React to supabase auth storage changes
      if (event.key?.includes('supabase.auth') && employeeData?.id && currentRecord && status !== 'clocked-out') {
        // User likely logged out in another tab or window
        if (event.newValue === null || !event.newValue.includes('access_token')) {
          await performAutoClockout(employeeData.id, currentRecord);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentRecord, employeeData?.id, status]);

  const handleClockIn = async () => {
    if (!employeeData?.id) return;

    const now = new Date();
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeData.id,
        check_in: now.toISOString(),
        date: now.toISOString().split('T')[0],
        status: 'Present'
      })
      .select()
      .single();

    if (error) {
      console.error('Error clocking in:', error);
      toast({
        title: "Error Clocking In",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCurrentRecord(data.id);
    setStatus('clocked-in');
    toast({
      title: "Clocked In",
      description: `You clocked in at ${format(now, 'h:mm a')}`,
    });
  };

  const handleClockOut = async () => {
    if (!currentRecord) return;

    const now = new Date();
    const { error } = await supabase
      .from('attendance')
      .update({
        check_out: now.toISOString()
      })
      .eq('id', currentRecord);

    if (error) {
      console.error('Error clocking out:', error);
      toast({
        title: "Error Clocking Out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCurrentRecord(null);
    setStatus('clocked-out');
    toast({
      title: "Clocked Out",
      description: `You clocked out at ${format(now, 'h:mm a')}`,
    });
  };

  const handleBreakStart = async () => {
    if (!currentRecord) return;
    
    const now = new Date();
    const { error } = await supabase
      .from('attendance')
      .update({
        break_start: now.toISOString()
      })
      .eq('id', currentRecord);

    if (error) {
      console.error('Error starting break:', error);
      toast({
        title: "Error Starting Break",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setStatus('on-break');
    toast({
      title: "Break Started",
      description: `Your break started at ${format(now, 'h:mm a')}`,
    });
  };

  const handleBreakEnd = async () => {
    if (!currentRecord) return;
    
    const now = new Date();
    const { data: record, error: fetchError } = await supabase
      .from('attendance')
      .select('break_start')
      .eq('id', currentRecord)
      .single();

    if (fetchError) {
      console.error('Error fetching break start time:', fetchError);
      toast({
        title: "Error Ending Break",
        description: fetchError.message,
        variant: "destructive",
      });
      return;
    }

    if (record?.break_start) {
      const breakStart = new Date(record.break_start);
      const breakMinutes = Math.round((now.getTime() - breakStart.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('attendance')
        .update({
          break_minutes: breakMinutes,
          break_start: null
        })
        .eq('id', currentRecord);

      if (error) {
        console.error('Error ending break:', error);
        toast({
          title: "Error Ending Break",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setStatus('clocked-in');
    toast({
      title: "Break Ended",
      description: `Your break ended at ${format(now, 'h:mm a')}`,
    });
  };

  return {
    status,
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd
  };
};
