import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/services/notifications';

export interface Employee {
  id: string;
  name: string;
  email?: string;
  job_title: string;
  department: string;
  site: string;
  salary: number;
  hourly_rate?: number;
  start_date: string;
  lifecycle: string;
  status: string;
  avatar?: string;
  avatar_url?: string;
  location?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  user_id?: string;
  managerId?: string;
  manager_id?: string;
  role?: string;
  jobTitle?: string;
  startDate?: string;
  statusColor?: 'green' | 'gray';
  employment_type?: string;
  job_description?: string;
  probation_end_date?: string;
  shift_pattern_id?: string;
  monday_shift_id?: string;
  tuesday_shift_id?: string;
  wednesday_shift_id?: string;
  thursday_shift_id?: string;
  friday_shift_id?: string;
  saturday_shift_id?: string;
  sunday_shift_id?: string;
  
  // Weekly availability fields
  monday_available?: boolean;
  monday_start_time?: string;
  monday_end_time?: string;
  tuesday_available?: boolean;
  tuesday_start_time?: string;
  tuesday_end_time?: string;
  wednesday_available?: boolean;
  wednesday_start_time?: string;
  wednesday_end_time?: string;
  thursday_available?: boolean;
  thursday_start_time?: string;
  thursday_end_time?: string;
  friday_available?: boolean;
  friday_start_time?: string;
  friday_end_time?: string;
  saturday_available?: boolean;
  saturday_start_time?: string;
  saturday_end_time?: string;
  sunday_available?: boolean;
  sunday_start_time?: string;
  sunday_end_time?: string;
}

export interface EmployeeFilterOptions {
  departments: string[];
  sites: string[];
  lifecycles: string[];
  statuses: string[];
}

export const useEmployees = (filters: {
  department?: string;
  site?: string;
  lifecycle?: string;
  status?: string;
} = {}) => {
  const { department, site, lifecycle, status } = filters;

  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      // Get current user's role and manager_id first to ensure data isolation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentEmployee } = await supabase
        .from('employees')
        .select('manager_id, role')
        .eq('user_id', user.id)
        .single();

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const hasManagementRole = userRoles?.some(ur => 
        ['admin', 'employer', 'hr', 'manager', 'payroll'].includes(ur.role)
      );

      let query = supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });

      // Apply data isolation based on manager_id for non-management users
      if (!hasManagementRole && currentEmployee?.manager_id) {
        query = query.or(`user_id.eq.${user.id},manager_id.eq.${currentEmployee.manager_id}`);
      }

      if (department) {
        query = query.eq('department', department);
      }
      if (site) {
        query = query.eq('site', site);
      }
      if (lifecycle) {
        query = query.eq('lifecycle', lifecycle);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      return data as Employee[];
    },
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        throw error;
      }

      return data as Employee;
    },
    enabled: !!id, // Ensure the query is only enabled when the employee ID is available
  });
};

export const useEmployeeFilters = () => {
  return useQuery({
    queryKey: ['employeeFilters'],
    queryFn: async () => {
      const [
        { data: departments, error: departmentsError },
        { data: sites, error: sitesError },
        { data: lifecycles, error: lifecyclesError },
        { data: statuses, error: statusesError },
      ] = await Promise.all([
        supabase.from('employees').select('department').order('department', { ascending: true }),
        supabase.from('employees').select('site').order('site', { ascending: true }),
        supabase.from('employees').select('lifecycle').order('lifecycle', { ascending: true }),
        supabase.from('employees').select('status').order('status', { ascending: true }),
      ]);

      if (departmentsError || sitesError || lifecyclesError || statusesError) {
        console.error('Error fetching employee filters:', departmentsError || sitesError || lifecyclesError || statusesError);
        throw departmentsError || sitesError || lifecyclesError || statusesError;
      }

      const uniqueDepartments = [...new Set(departments?.map(d => d.department))].filter(Boolean) as string[];
      const uniqueSites = [...new Set(sites?.map(s => s.site))].filter(Boolean) as string[];
      const uniqueLifecycles = [...new Set(lifecycles?.map(l => l.lifecycle))].filter(Boolean) as string[];
      const uniqueStatuses = [...new Set(statuses?.map(s => s.status))].filter(Boolean) as string[];

      return {
        departments: uniqueDepartments,
        sites: uniqueSites,
        lifecycles: uniqueLifecycles,
        statuses: uniqueStatuses,
      } as EmployeeFilterOptions;
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', employee.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee'] });
    },
    onError: (error) => {
      console.error('Error updating employee:', error);
      throw error;
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, get employee details for cleanup
      const { data: employeeData, error: fetchError } = await supabase
        .from('employees')
        .select('user_id, name, manager_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching employee before deletion:', fetchError);
        throw fetchError;
      }

      // If employee has a user_id, use the safe deletion function
      if (employeeData?.user_id) {
        console.log('Deleting employee with user account using safe deletion');
        const { data: deleteResult, error: deleteError } = await supabase.functions.invoke('delete-user-account');
        
        if (deleteError) {
          throw new Error(`Failed to delete user account: ${deleteError.message}`);
        }
        
        return { ...employeeData, deleted_with_user: true };
      } else {
        // For employees without user accounts, clean up references first
        console.log('Deleting employee without user account');
        
        // Clean up any manager references first
        if (employeeData?.manager_id) {
          await supabase
            .from('employees')
            .update({ manager_id: null })
            .eq('manager_id', id);
        }
        
        // Delete the employee record
        const { data, error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      // Invalidate all related queries to prevent stale data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Clear any cached employee-specific data
      queryClient.removeQueries({ queryKey: ['employee', data.id] });
    },
    onError: (error) => {
      console.error('Error deleting employee:', error);
      
      // Provide specific error messages for common deletion issues
      let errorMessage = "Failed to delete employee";
      if (error instanceof Error) {
        if (error.message.includes('foreign key')) {
          errorMessage = "Cannot delete employee: they have associated records that must be removed first";
        } else if (error.message.includes('not found')) {
          errorMessage = "Employee not found or already deleted";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error deleting employee",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id'>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;

      // Send notifications to all managers about the new employee
      const { data: managers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['employer', 'admin', 'hr']);

      if (managers && managers.length > 0) {
        // Send notification to each manager
        for (const manager of managers) {
          await sendNotification({
            user_id: manager.user_id,
            title: '👥 New Employee Added',
            message: `${employee.name} has been added to the team as ${employee.job_title} in the ${employee.department} department.`,
            type: 'info',
            related_entity: 'employees',
            related_id: data.id
          });
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Employee added",
        description: `${data.name} has been added to the team.`,
      });
    },
    onError: (error) => {
      console.error('Error adding employee:', error);
      toast({
        title: "Error adding employee",
        description: error instanceof Error ? error.message : "Failed to add employee",
        variant: "destructive",
      });
    },
  });
};
