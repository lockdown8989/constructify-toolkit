
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { createDefaultShift } from './shift-sync';
import { initializeAttendance } from './attendance-sync';
import { setupEmployeeSalary } from './salary-sync';
import { assignLeavePolicy } from './leave-sync';
import { initializePayslipTemplate } from './payslip-sync';

export const syncEmployeeData = async (employee: Employee, isNew: boolean = false) => {
  try {
    console.log(`${isNew ? 'Creating' : 'Updating'} employee synchronization for:`, employee.name);
    
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
      
      // Sync with payslip template
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
        const oldEmployee = payload.old as Employee;
        
        // Determine if this is a new employee or an update
        const isNew = payload.eventType === 'INSERT';
        
        // Sync the employee data
        await syncEmployeeData(employee, isNew);
        
        // If this is an update and role or department has changed, perform additional actions
        if (!isNew && oldEmployee) {
          if (oldEmployee.job_title !== employee.job_title || 
              oldEmployee.department !== employee.department || 
              oldEmployee.salary !== employee.salary) {
            
            console.log('Employee role, department or salary changed. Recalculating...');
            
            // Recalculate salary if role/department/salary changed
            await import('./salary-sync').then(module => 
              module.recalculateSalary(employee.id)
            );
            
            // Update shift rules if role changed
            if (oldEmployee.job_title !== employee.job_title) {
              await import('./shift-sync').then(module => 
                module.updateShiftRules(employee.id, employee.job_title)
              );
            }
          }
        }
        
        console.log(`Employee ${isNew ? 'creation' : 'update'} synchronized:`, employee.name);
      }
    )
    .subscribe();
    
  console.log('Realtime subscriptions for employee changes set up');
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Function to handle employee batch operations
export const batchSyncEmployees = async (employeeIds: string[]) => {
  try {
    let successCount = 0;
    let failCount = 0;
    
    for (const id of employeeIds) {
      try {
        // Get employee data
        const { data: employee, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Sync employee data
        await syncEmployeeData(employee, false);
        successCount++;
      } catch (error) {
        console.error(`Error syncing employee ${id}:`, error);
        failCount++;
      }
    }
    
    return {
      success: failCount === 0,
      successCount,
      failCount
    };
  } catch (error) {
    console.error('Error in batch sync operation:', error);
    throw error;
  }
};
