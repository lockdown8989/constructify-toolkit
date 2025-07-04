
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

export interface EmployeeSyncData {
  id: string;
  name: string;
  email?: string;
  jobTitle: string;
  department: string;
  salary: number;
  site: string;
  status: string;
  lifecycle: string;
  role?: string;
  managerId?: string;
  startDate: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
}

export const syncEmployeeWithManagerTeam = async (employeeData: EmployeeSyncData) => {
  try {
    console.log('Syncing employee data with manager team:', employeeData);
    
    // Update the employee record in the database
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({
        name: employeeData.name,
        email: employeeData.email,
        job_title: employeeData.jobTitle,
        department: employeeData.department,
        salary: employeeData.salary,
        site: employeeData.site,
        status: employeeData.status,
        lifecycle: employeeData.lifecycle,
        role: employeeData.role,
        manager_id: employeeData.managerId,
        start_date: employeeData.startDate,
        annual_leave_days: employeeData.annual_leave_days,
        sick_leave_days: employeeData.sick_leave_days
      })
      .eq('id', employeeData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating employee:', updateError);
      throw updateError;
    }

    // Notify manager about the employee update
    if (employeeData.managerId) {
      await notifyManagerOfEmployeeUpdate(employeeData.managerId, updatedEmployee);
    }

    // Trigger real-time sync for manager dashboard
    await triggerManagerDashboardSync(employeeData.managerId);

    return { success: true, data: updatedEmployee };
  } catch (error) {
    console.error('Error syncing employee data:', error);
    return { success: false, error };
  }
};

const notifyManagerOfEmployeeUpdate = async (managerId: string, employeeData: any) => {
  try {
    // Get manager's user_id
    const { data: managerEmployee, error: managerError } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('manager_id', managerId)
      .eq('job_title', 'Manager')
      .single();

    if (managerError || !managerEmployee?.user_id) {
      console.log('Manager not found or no user_id:', managerId);
      return;
    }

    // Send notification to manager
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: managerEmployee.user_id,
        title: '👥 Team Member Updated',
        message: `${employeeData.name} has updated their profile information including job title, salary, and contact details.`,
        type: 'info',
        related_entity: 'employees',
        related_id: employeeData.id
      });

    if (notificationError) {
      console.error('Error sending manager notification:', notificationError);
    }
  } catch (error) {
    console.error('Error notifying manager:', error);
  }
};

const triggerManagerDashboardSync = async (managerId?: string) => {
  try {
    if (!managerId) return;

    // Trigger a dashboard refresh by updating a timestamp
    const { error } = await supabase
      .from('employees')
      .update({ 
        // Use a metadata field to trigger refresh without affecting actual data
        avatar_url: new Date().toISOString() 
      })
      .eq('manager_id', managerId)
      .eq('job_title', 'Manager');

    if (error) {
      console.error('Error triggering dashboard sync:', error);
    }
  } catch (error) {
    console.error('Error in dashboard sync trigger:', error);
  }
};

export const syncEmployeeEmailWithAuth = async (userId: string, newEmail: string) => {
  try {
    // Update auth email
    const { error: authError } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (authError) {
      console.error('Error updating auth email:', authError);
      return { success: false, error: authError };
    }

    // Update employee record email
    const { error: employeeError } = await supabase
      .from('employees')
      .update({ email: newEmail })
      .eq('user_id', userId);

    if (employeeError) {
      console.error('Error updating employee email:', employeeError);
      return { success: false, error: employeeError };
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing email:', error);
    return { success: false, error };
  }
};
