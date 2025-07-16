// Role management utilities
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';

export interface RoleData {
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isPayroll: boolean;
  userRole: UserRole | null;
  roles: UserRole[];
}

export const fetchUserRoles = async (userId: string): Promise<RoleData> => {
  console.log('🔄 Fetching roles for user:', userId);
  
  try {
    // Fetch user roles from user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError);
    }

    // Fetch employee record for fallback role
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('role, job_title')
      .eq('user_id', userId)
      .maybeSingle();

    if (employeeError) {
      console.error('❌ Error fetching employee data:', employeeError);
    }

    // Combine roles from both sources
    const roles: UserRole[] = [];
    
    if (userRoles) {
      roles.push(...userRoles.map(r => r.role as UserRole));
    }
    
    // Add employee role if it exists and isn't already included
    if (employeeData?.role && !roles.includes(employeeData.role as UserRole)) {
      roles.push(employeeData.role as UserRole);
    }
    
    console.log('🎭 User roles found:', roles);
    
    // Determine role flags
    const isAdmin = roles.includes('admin');
    const isHR = roles.includes('hr');
    const isManager = roles.includes('employer') || roles.includes('manager');
    const isPayroll = roles.includes('payroll');
    const isEmployee = roles.includes('employee') || 
      (!isAdmin && !isHR && !isManager && !isPayroll && roles.length === 0);
    
    // Determine primary role
    let userRole: UserRole | null = null;
    if (isAdmin) userRole = 'admin';
    else if (isHR) userRole = 'hr';
    else if (isManager) userRole = roles.includes('employer') ? 'employer' : 'manager';
    else if (isPayroll) userRole = 'payroll';
    else if (isEmployee) userRole = 'employee';
    
    const roleData: RoleData = {
      isAdmin,
      isHR,
      isManager,
      isEmployee,
      isPayroll,
      userRole,
      roles
    };
    
    console.log('✅ Role data processed:', roleData);
    
    return roleData;
  } catch (error) {
    console.error('💥 Error in fetchUserRoles:', error);
    
    // Return default employee role on error
    return {
      isAdmin: false,
      isHR: false,
      isManager: false,
      isEmployee: true,
      isPayroll: false,
      userRole: 'employee',
      roles: ['employee']
    };
  }
};

export const assignUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();
    
    if (error) {
      console.error('Error assigning role:', error);
      return false;
    }
    
    console.log(`✅ Assigned role ${role} to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in assignUserRole:', error);
    return false;
  }
};

export const removeUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) {
      console.error('Error removing role:', error);
      return false;
    }
    
    console.log(`✅ Removed role ${role} from user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in removeUserRole:', error);
    return false;
  }
};