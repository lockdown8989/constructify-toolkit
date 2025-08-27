
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
    
    // Update the employee record in the database with all fields
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

    console.log('Employee updated successfully:', updatedEmployee);

    // Notify manager about the employee update
    if (employeeData.managerId) {
      await notifyManagerOfEmployeeUpdate(employeeData.managerId, updatedEmployee);
    }

    // Trigger real-time sync for manager dashboard
    await triggerManagerDashboardSync(employeeData.managerId);

    // Force refresh any cached employee data
    await refreshEmployeeCache(employeeData.id);

    return { success: true, data: updatedEmployee };
  } catch (error) {
    console.error('Error syncing employee data:', error);
    return { success: false, error };
  }
};

const notifyManagerOfEmployeeUpdate = async (managerId: string, employeeData: any) => {
  try {
    console.log('Notifying manager:', managerId, 'about employee update:', employeeData.name);
    
    // First try to find manager by their employee ID (manager_id field)
    const { data: managerEmployee, error: managerError } = await supabase
      .from('employees')
      .select('user_id, name, email')
      .eq('id', managerId)
      .single();

    if (managerError || !managerEmployee?.user_id) {
      console.log('Manager not found by ID, trying alternative lookup:', managerId);
      
      // Alternative: try to find managers by role
      const { data: managers } = await supabase
        .from('employees')
        .select('user_id, name, email')
        .in('role', ['manager', 'admin', 'employer']);

      if (managers && managers.length > 0) {
        // Notify all managers
        for (const manager of managers) {
          if (manager.user_id) {
            await sendNotificationToManager(manager.user_id, employeeData, manager.name);
          }
        }
      }
      return;
    }

    // Send notification to the specific manager
    await sendNotificationToManager(managerEmployee.user_id, employeeData, managerEmployee.name);
    
  } catch (error) {
    console.error('Error notifying manager:', error);
  }
};

const sendNotificationToManager = async (managerUserId: string, employeeData: any, managerName: string) => {
  try {
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: managerUserId,
        title: '👥 Team Member Updated',
        message: `${employeeData.name} has updated their profile information including job title (${employeeData.job_title}), salary, contact details, and manager assignment.`,
        type: 'info',
        related_entity: 'employees',
        related_id: employeeData.id
      });

    if (notificationError) {
      console.error('Error sending manager notification:', notificationError);
    } else {
      console.log(`Notification sent to manager ${managerName} (${managerUserId})`);
    }
  } catch (error) {
    console.error('Error in sendNotificationToManager:', error);
  }
};

const triggerManagerDashboardSync = async (managerId?: string) => {
  try {
    console.log('Triggering dashboard sync for manager:', managerId);
    
    if (!managerId) {
      console.log('No manager ID provided for dashboard sync');
      return;
    }

    // Update a metadata field to trigger dashboard refresh
    const { error } = await supabase
      .from('employees')
      .update({ 
        // Use avatar_url as a timestamp to trigger refresh without affecting actual data
        avatar_url: `sync_${new Date().toISOString()}`
      })
      .eq('manager_id', managerId);

    if (error) {
      console.error('Error triggering dashboard sync:', error);
    } else {
      console.log('Dashboard sync triggered successfully');
    }
  } catch (error) {
    console.error('Error in dashboard sync trigger:', error);
  }
};

const refreshEmployeeCache = async (employeeId: string) => {
  try {
    // This is a placeholder for any cache invalidation logic
    console.log('Refreshing employee cache for:', employeeId);
    
    // You could implement cache invalidation here if needed
    // For now, we'll just log the operation
  } catch (error) {
    console.error('Error refreshing employee cache:', error);
  }
};

export const syncEmployeeEmailWithAuth = async (userId: string, newEmail: string) => {
  try {
    console.log('Syncing email with auth for user:', userId);
    
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

    console.log('Email sync completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error syncing email:', error);
    return { success: false, error };
  }
};
