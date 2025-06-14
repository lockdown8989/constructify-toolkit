import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
      console.log("Fetching employees with roles:", { isPayroll, isAdmin, isHR, isManager });
      
      let query = supabase
        .from('employees')
        .select('*');
      
      // For payroll users, admins, and HR - show all employees
      if (isPayroll || isAdmin || isHR) {
        console.log("Payroll/Admin/HR user, fetching all employee data");
        // No additional filters for these roles - they should see all employees
      } else if (isManager && user) {
        // For managers - show employees under their management
        console.log("Manager user, fetching team data");
        const { data: managerData } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('user_id', user.id)
          .single();
        
        if (managerData && managerData.manager_id) {
          query = query.or(`manager_id.eq.${managerData.manager_id},user_id.eq.${user.id}`);
        }
      } else if (!isManager && !isPayroll && !isAdmin && !isHR && user) {
        // For regular employees - show only their own data
        console.log("Regular employee user, fetching own data only");
        const { data: currentEmployeeData } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (currentEmployeeData) {
          query = query.eq('id', currentEmployeeData.id);
        } else {
          console.log("No employee record found for user");
          return [];
        }
      }
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.department) query = query.eq('department', filters.department);
        if (filters.site) query = query.eq('site', filters.site);
        if (filters.lifecycle) query = query.eq('lifecycle', filters.lifecycle);
      }
      
      // Order by name for consistent display
      query = query.order('name');
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      console.log("Successfully fetched employees:", data?.length || 0, "records");
      return data as Employee[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
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
  const { isPayroll, isAdmin, isHR, isManager } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: EmployeeUpdate & { id: string }) => {
      // Ensure payroll users can update salary fields
      if (isPayroll || isAdmin || isHR || isManager) {
        console.log("Authorized user updating employee data:", { id, update });
      }
      
      const { data, error } = await supabase
        .from('employees')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating employee:", error);
        throw error;
      }
      return data as Employee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.id] });
      toast({
        title: "Employee updated",
        description: "Employee information has been successfully updated."
      });
    },
    onError: (error) => {
      console.error("Update employee error:", error);
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
        throw new Error('No authenticated user');
      }

      console.log("Fetching employee data for user:", user.id);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching own employee data:", error);
        return null; // Return null instead of throwing error
      }

      if (!data) {
        console.log("No employee record found for user:", user.id);
        return null; // Return null if no data found
      }

      return data as Employee;
    },
    enabled: !!user,
    retry: 3, // Retry up to 3 times
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
  });
}
