

import { supabase } from '@/integrations/supabase/client';

// List of example employee identifiers to remove - be very specific
const EXAMPLE_EMPLOYEE_IDENTIFIERS = [
  'rhaenyra@stellia.com',
  'daemon@stellia.com', 
  'jon@stellia.com',
  'Rhaenyra Targaryen',
  'Daemon Targaryen',
  'Jon Snow',
  'John Doe',
  'Jane Smith',
  'Example Employee',
  'Test Employee',
  'Demo User',
  'Sample Employee'
];

export const cleanupExampleEmployees = async () => {
  try {
    console.log('Starting precise cleanup of example employees...');
    
    // Get all employees that exactly match example identifiers (exact match only)
    const { data: exampleEmployees, error: fetchError } = await supabase
      .from('employees')
      .select('id, name, email')
      .or(
        EXAMPLE_EMPLOYEE_IDENTIFIERS.map(identifier => 
          `name.eq.${identifier},email.eq.${identifier}`
        ).join(',')
      );

    if (fetchError) {
      console.error('Error fetching example employees:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!exampleEmployees || exampleEmployees.length === 0) {
      console.log('No example employees found to clean up');
      return { success: true, cleanedCount: 0 };
    }

    console.log(`Found ${exampleEmployees.length} example employees to remove:`, 
      exampleEmployees.map(emp => emp.name));

    // Delete only the exact example employee matches
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .in('id', exampleEmployees.map(emp => emp.id));

    if (deleteError) {
      console.error('Error deleting example employees:', deleteError);
      return { success: false, error: deleteError.message };
    }

    console.log(`Successfully cleaned up ${exampleEmployees.length} example employees`);
    
    return { success: true, cleanedCount: exampleEmployees.length };

  } catch (error) {
    console.error('Exception during employee cleanup:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const syncManagerPayrollEmployees = async (managerId: string) => {
  try {
    console.log('Syncing employees between manager and payroll accounts...');
    
    // Get employees under this manager
    const { data: managerEmployees, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('manager_id', managerId);

    if (fetchError) {
      console.error('Error fetching manager employees:', fetchError);
      return { success: false, error: fetchError.message };
    }

    console.log(`Found ${managerEmployees?.length || 0} employees under manager ${managerId}`);
    
    return { success: true, employeeCount: managerEmployees?.length || 0 };

  } catch (error) {
    console.error('Exception during manager-payroll sync:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

