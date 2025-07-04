import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { createDefaultShift } from './shift-sync';
import { initializeAttendance } from './attendance-sync';
import { setupEmployeeSalary } from './salary-sync';
import { assignLeavePolicy } from './leave-sync';
import { initializePayslipTemplate } from './payslip-sync';
import { notifyManagersOfNewEmployee } from '@/services/notifications/notification-sender';

export const syncEmployeeData = async (employee: Employee, isNew: boolean = false) => {
  try {
    console.log(`${isNew ? 'Creating' : 'Updating'} employee synchronization for:`, employee.name);
    
    // If this is a new employee, notify managers
    if (isNew) {
      await notifyManagersOfNewEmployee(
        employee.name,
        employee.job_title || 'Employee',
        employee.department || 'General',
        employee.id
      );
    }
    
    // Start all sync operations in parallel for efficiency
    const results = await Promise.allSettled([
      // Sync with shifts module
      createDefaultShift(employee),
      
      // Sync with attendance module
      initializeAttendance(employee),
      
      // Sync with salary module
      setupEmployeeSalary(employee),
      
      // Sync with leave module
      assignLeavePolicy(employee),
      
      // Sync with payslip module
      initializePayslipTemplate(employee)
    ]);
    
    // Check for any failed operations
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some synchronization operations failed:', 
        failures.map(f => (f as PromiseRejectedResult).reason));
    }
    
    return {
      success: failures.length === 0,
      failures: failures.length > 0 ? failures.map(f => (f as PromiseRejectedResult).reason) : []
    };
  } catch (error) {
    console.error('Error in employee synchronization:', error);
    throw error;
  }
};

// Add the new synchronization export
export { syncEmployeeWithManagerTeam, syncEmployeeEmailWithAuth } from './employee-data-sync';

// Hook into employee creation/updates
export const setupRealtimeSubscriptions = () => {
  const channel = supabase
    .channel('employee-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'employees'
      },
      async (payload) => {
        const employee = payload.new as Employee;
        
        // Determine if this is a new employee or an update
        const isNew = payload.eventType === 'INSERT';
        
        // Sync the employee data
        await syncEmployeeData(employee, isNew);
        
        console.log(`Employee ${isNew ? 'creation' : 'update'} synchronized:`, employee.name);
      }
    )
    .subscribe();
    
  console.log('Realtime subscriptions for employee changes set up');
  
  return () => {
    supabase.removeChannel(channel);
  };
};
