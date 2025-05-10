
import { supabase } from '@/integrations/supabase/client';

// Utility function to get all manager user IDs
export const getManagerUserIds = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr']);
      
    if (error) throw error;
    
    return data.map(role => role.user_id);
  } catch (error) {
    console.error('Error fetching manager user IDs:', error);
    return [];
  }
};

// Utility function to get all employees user IDs
export const getEmployeeUserIds = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('user_id')
      .not('user_id', 'is', null);
      
    if (error) throw error;
    
    return data.map(employee => employee.user_id);
  } catch (error) {
    console.error('Error fetching employee user IDs:', error);
    return [];
  }
};
