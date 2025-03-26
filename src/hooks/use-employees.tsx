
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type Employee = Database['public']['Tables']['employees']['Row'];
export type NewEmployee = Database['public']['Tables']['employees']['Insert'];
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];
export type UserEmployeeMapping = Database['public']['Tables']['user_employee_mapping']['Row'];

export function useEmployees(filters?: Partial<{
  status: string;
  department: string;
  site: string;
  lifecycle: string;
  manager_id: string;
}>) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('*');
      
      if (filters) {
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.department) query = query.eq('department', filters.department);
        if (filters.site) query = query.eq('site', filters.site);
        if (filters.lifecycle) query = query.eq('lifecycle', filters.lifecycle);
        if (filters.manager_id) query = query.eq('manager_id', filters.manager_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Employee[];
    }
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id
  });
}

export function useEmployeeByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['employee-by-user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // First get the employee_id from the mapping table
      const { data: mappingData, error: mappingError } = await supabase
        .from('user_employee_mapping')
        .select('employee_id')
        .eq('user_id', userId)
        .single();
      
      if (mappingError) {
        if (mappingError.code === 'PGRST116') {
          // No mapping found
          return null;
        }
        throw mappingError;
      }
      
      if (!mappingData) return null;
      
      // Then get the employee details
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', mappingData.employee_id)
        .single();
      
      if (employeeError) throw employeeError;
      return employeeData as Employee;
    },
    enabled: !!userId
  });
}

export function useTeamMembers(managerId: string | undefined) {
  return useQuery({
    queryKey: ['team-members', managerId],
    queryFn: async () => {
      if (!managerId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('manager_id', managerId);
      
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!managerId
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (newEmployee: NewEmployee & { linkToCurrentUser?: boolean }) => {
      const { linkToCurrentUser, ...employeeData } = newEmployee;
      
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();
      
      if (error) throw error;
      
      // If linkToCurrentUser is true and user exists, create a mapping
      if (linkToCurrentUser && user) {
        const { error: mappingError } = await supabase
          .from('user_employee_mapping')
          .insert({
            user_id: user.id,
            employee_id: data.id
          });
        
        if (mappingError) throw mappingError;
      }
      
      return data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Employee added",
        description: "New employee has been successfully added."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add employee",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: EmployeeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Employee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.id] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Employee updated",
        description: "Employee information has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update employee",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First delete any user-employee mapping
      const { error: mappingError } = await supabase
        .from('user_employee_mapping')
        .delete()
        .eq('employee_id', id);
      
      if (mappingError) throw mappingError;
      
      // Then delete the employee
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-by-user'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Employee deleted",
        description: "Employee has been successfully removed from the system."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete employee",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useLinkUserToEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, employeeId }: { userId: string, employeeId: string }) => {
      // Check if mapping already exists
      const { data: existingMapping, error: checkError } = await supabase
        .from('user_employee_mapping')
        .select('*')
        .eq('user_id', userId);
      
      if (checkError) throw checkError;
      
      // If mapping exists, update it
      if (existingMapping && existingMapping.length > 0) {
        const { error: updateError } = await supabase
          .from('user_employee_mapping')
          .update({ employee_id: employeeId })
          .eq('user_id', userId);
        
        if (updateError) throw updateError;
      } else {
        // If no mapping exists, create a new one
        const { error: insertError } = await supabase
          .from('user_employee_mapping')
          .insert({
            user_id: userId,
            employee_id: employeeId
          });
        
        if (insertError) throw insertError;
      }
      
      return { userId, employeeId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-by-user'] });
      toast({
        title: "User linked",
        description: "User has been successfully linked to an employee record."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to link user",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useEmployeeFilters() {
  return useQuery({
    queryKey: ['employee-filters'],
    queryFn: async () => {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('department, site, lifecycle, status');
      
      if (error) throw error;
      
      const departments = [...new Set(employees.map(e => e.department))];
      const sites = [...new Set(employees.map(e => e.site))];
      const lifecycles = [...new Set(employees.map(e => e.lifecycle))];
      const statuses = [...new Set(employees.map(e => e.status))];
      
      return {
        departments,
        sites,
        lifecycles,
        statuses
      };
    }
  });
}

export function useManagers() {
  const { userRole } = useAuth();
  
  return useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      // Get all employees who have manager role users connected to them
      const { data: managers, error } = await supabase
        .from('employees')
        .select(`
          id,
          name,
          job_title,
          department
        `)
        .eq('job_title', 'Manager')
        .order('name');
      
      if (error) throw error;
      return managers as Pick<Employee, 'id' | 'name' | 'job_title' | 'department'>[];
    },
    // Only run for HR, admin, or managers
    enabled: userRole === 'hr' || userRole === 'admin' || userRole === 'manager'
  });
}
