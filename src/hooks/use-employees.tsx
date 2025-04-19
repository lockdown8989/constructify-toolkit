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
  const { user, isManager } = useAuth();
  
  return useQuery({
    queryKey: ['employees', filters, isManager, user?.id],
    queryFn: async () => {
      // Start building the query
      let query = supabase
        .from('employees')
        .select('*');
      
      // If user is not a manager, only show their own data
      if (!isManager && user) {
        console.log("Non-manager user, fetching own data only");
        // Find the employee record associated with the current user
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
      } else if (isManager && user) {
        // For managers, get their manager_id first
        const { data: managerData } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('user_id', user.id)
          .single();
        
        // Include only employees who are linked to this manager's ID or the manager themselves
        if (managerData && managerData.manager_id) {
          query = query.or(`manager_id.eq.${managerData.manager_id},user_id.eq.${user.id}`);
        }
      }
      
      // Apply any filters passed to the hook
      if (filters) {
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.department) query = query.eq('department', filters.department);
        if (filters.site) query = query.eq('site', filters.site);
        if (filters.lifecycle) query = query.eq('lifecycle', filters.lifecycle);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      console.log("Fetched employees data:", data);
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

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching own employee data:", error);
        toast({
          title: "Error",
          description: "Could not fetch your employee information",
          variant: "destructive"
        });
        throw error;
      }

      return data as Employee;
    },
    enabled: !!user
  });
}
