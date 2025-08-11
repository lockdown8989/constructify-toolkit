import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { debug } from '@/utils/debug';

export type Employee = Database['public']['Tables']['employees']['Row'];
export type NewEmployee = Database['public']['Tables']['employees']['Insert'];
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export function useEmployees(filters?: Partial<{
  status: string;
  department: string;
  site: string;
  lifecycle: string;
}>) {
  const { user, isManager, isPayroll, isAdmin, isHR } = useAuth();
  
  return useQuery({
    queryKey: ['employees', filters, isManager, isPayroll, isAdmin, isHR, user?.id],
    queryFn: async () => {
      try {
        // If no user, return empty array instead of throwing error
        if (!user) {
          debug.auth('No authenticated user, returning empty employees list');
          return [];
        }

        // Optimized query - select only necessary columns
        let query = supabase
          .from('employees')
          .select('id, user_id, name, email, job_title, department, site, status, lifecycle, avatar_url, salary, start_date, manager_id, role');
        
        debug.employee('Employee query - User roles:', { isManager, isPayroll, isAdmin, isHR });
        
        // For payroll users, admins, and HR - show all employees
        if (isPayroll || isAdmin || isHR) {
          debug.employee("Payroll/Admin/HR user, fetching all employee data");
          // No restrictions for these roles - they should see all employees
        } else if (isManager && user) {
          // For managers - show employees under their management
          debug.employee("Manager user, fetching team data");
          const { data: managerData, error: managerError } = await supabase
            .from('employees')
            .select('manager_id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (managerError) {
            debug.error('Error fetching manager data:', managerError);
            // Continue with showing all employees if manager data fetch fails
          } else if (managerData && managerData.manager_id) {
            query = query.or(`manager_id.eq.${managerData.manager_id},user_id.eq.${user.id}`);
          } else {
            // If manager doesn't have manager_id set, show all employees (they might be the top-level manager)
            debug.employee("Manager without manager_id, showing all employees");
          }
        } else if (!isManager && !isPayroll && !isAdmin && !isHR && user) {
          // For regular employees - show only their own data
          debug.employee("Regular employee user, fetching own data only");
          const { data: currentEmployeeData, error: employeeError } = await supabase
            .from('employees')
            .select('id, user_id, name, email, job_title, department, site, status')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (employeeError) {
            debug.error('Error fetching employee data:', employeeError);
            return [];
          }
            
          if (currentEmployeeData) {
            query = query.eq('id', currentEmployeeData.id);
          } else {
            debug.employee("No employee record found for user");
            return [];
          }
        }
        
        if (filters) {
          if (filters.status) query = query.eq('status', filters.status);
          if (filters.department) query = query.eq('department', filters.department);
          if (filters.site) query = query.eq('site', filters.site);
          if (filters.lifecycle) query = query.eq('lifecycle', filters.lifecycle);
        }
        
        const { data, error } = await query;
        
        if (error) {
          debug.error("Error fetching employees:", error);
          // Return empty array instead of throwing to prevent app crashes
          return [];
        }
        
        // Validate and clean the employee data
        const validEmployees = (data || []).filter(employee => {
          if (!employee || !employee.id || !employee.name) {
            debug.warn('Invalid employee record found:', employee);
            return false;
          }
          return true;
        });
        
        debug.employee("Fetched and validated employees data:", validEmployees.length, "employees");
        return validEmployees as Employee[];
        
      } catch (error) {
        debug.error("Error in employees query function:", error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't throw errors to prevent app crashes
    throwOnError: false,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, user_id, name, email, job_title, department, site, status, lifecycle, avatar_url, salary, start_date, manager_id, role')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newEmployee: NewEmployee) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(newEmployee)
        .select()
        .single();
      
      if (error) throw error;
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
      debug.employee('Updating employee with data:', { id, ...update });
      
      const { data, error } = await supabase
        .from('employees')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        debug.error('Update employee error:', error);
        throw error;
      }
      
      debug.employee('Employee updated successfully:', data);
      return data as Employee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.id] });
      queryClient.invalidateQueries({ queryKey: ['employee-details', data.id] });
      toast({
        title: "Employee updated",
        description: "Employee information has been successfully updated."
      });
    },
    onError: (error) => {
      debug.error('Update employee mutation error:', error);
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
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
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

export function useOwnEmployeeData() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['own-employee-data', user?.id],
    queryFn: async () => {
      if (!user) {
        debug.auth('No authenticated user for employee data');
        return null;
      }

      debug.employee("Fetching employee data for user:", user.id);
      
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, user_id, name, email, job_title, department, site, status, lifecycle, avatar_url, salary, start_date, manager_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          debug.error("Error fetching own employee data:", error);
          return null;
        }

        if (!data) {
          debug.employee("No employee record found for user:", user.id);
          return null;
        }

        return data as Employee;
      } catch (error) {
        debug.error("Exception in useOwnEmployeeData:", error);
        return null;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 10 * 1000),
    // Don't throw errors to prevent app crashes
    throwOnError: false,
  });
}
