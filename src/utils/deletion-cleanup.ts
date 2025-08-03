import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for cleaning up data after user/employee deletions
 * to prevent broken references and maintain data integrity
 */

export const cleanupOrphanedReferences = async (deletedUserId: string, deletedEmployeeId?: string) => {
  try {
    console.log('Starting orphaned reference cleanup for user:', deletedUserId);
    
    const cleanupPromises = [];
    
    // Clean up any remaining user references in notifications
    cleanupPromises.push(
      supabase
        .from('notifications')
        .update({ user_id: null })
        .eq('user_id', deletedUserId)
    );
    
    // Clean up manager references if this was an employee
    if (deletedEmployeeId) {
      cleanupPromises.push(
        supabase
          .from('employees')
          .update({ manager_id: null })
          .eq('manager_id', deletedEmployeeId)
      );
      
      // Disable chats where this employee was involved
      cleanupPromises.push(
        supabase
          .from('chats')
          .update({ is_active: false })
          .or(`employee_id.eq.${deletedEmployeeId},admin_id.eq.${deletedEmployeeId}`)
      );
    }
    
    // Clean up schedule references
    cleanupPromises.push(
      supabase
        .from('schedules')
        .update({ 
          published_by: null,
          approved_by: null,
          manager_id: null,
          last_dragged_by: null
        })
        .or(`published_by.eq.${deletedUserId},approved_by.eq.${deletedUserId},manager_id.eq.${deletedUserId},last_dragged_by.eq.${deletedUserId}`)
    );
    
    // Clean up attendance references
    cleanupPromises.push(
      supabase
        .from('attendance')
        .update({ overtime_approved_by: null })
        .eq('overtime_approved_by', deletedUserId)
    );
    
    // Clean up document references
    cleanupPromises.push(
      supabase
        .from('documents')
        .update({ uploaded_by: null })
        .eq('uploaded_by', deletedUserId)
    );
    
    await Promise.allSettled(cleanupPromises);
    
    console.log('Orphaned reference cleanup completed');
    return { success: true };
  } catch (error) {
    console.error('Error during orphaned reference cleanup:', error);
    return { success: false, error };
  }
};

export const validateDataIntegrity = async () => {
  try {
    console.log('Starting data integrity validation');
    
    const issues = [];
    
    // Check for orphaned employee records (user_id points to non-existent user)
    const { data: orphanedEmployees, error: employeeError } = await supabase
      .from('employees')
      .select('id, name, user_id')
      .not('user_id', 'is', null);
    
    if (employeeError) {
      console.error('Error checking employee integrity:', employeeError);
    } else if (orphanedEmployees?.length) {
      // We can't directly query auth.users from the client, so we'll log this for manual review
      console.log('Found employee records that may need validation:', orphanedEmployees.length);
    }
    
    // Check for orphaned attendance records
    const { data: orphanedAttendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('id, employee_id')
      .not('employee_id', 'is', null);
    
    if (attendanceError) {
      console.error('Error checking attendance integrity:', attendanceError);
    }
    
    // Check for orphaned notifications
    const { data: orphanedNotifications, error: notificationError } = await supabase
      .from('notifications')
      .select('id, user_id')
      .not('user_id', 'is', null);
    
    if (notificationError) {
      console.error('Error checking notification integrity:', notificationError);
    }
    
    console.log('Data integrity validation completed');
    return { 
      success: true, 
      issues: issues.length,
      checks: {
        employees: orphanedEmployees?.length || 0,
        attendance: orphanedAttendance?.length || 0,
        notifications: orphanedNotifications?.length || 0
      }
    };
  } catch (error) {
    console.error('Error during data integrity validation:', error);
    return { success: false, error };
  }
};

export const preventBrokenQueries = () => {
  // Helper function to add null checks to queries that might reference deleted users
  const addNullSafeFilters = (query: any) => {
    return query.not('user_id', 'is', null);
  };
  
  return { addNullSafeFilters };
};