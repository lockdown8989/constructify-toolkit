
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase/database';

type EmployeeType = Database['public']['Tables']['employees']['Row'];

const fetchEmployees = async (filters: {
  department?: string;
  site?: string;
  lifecycle?: string;
  status?: string;
} = {}) => {
  let query = supabase.from('employees').select('*');

  if (filters.department) {
    query = query.eq('department', filters.department);
  }
  if (filters.site) {
    query = query.eq('site', filters.site);
  }
  if (filters.lifecycle) {
    query = query.eq('lifecycle', filters.lifecycle);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching employees:', error);
    throw new Error(error.message);
  }

  return data;
};

const useEmployees = (filters: {
  department?: string;
  site?: string;
  lifecycle?: string;
  status?: string;
} = {}) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => fetchEmployees(filters),
  });
};

const fetchEmployeeFilters = async () => {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('department, site, lifecycle, status');

  if (error) {
    console.error('Error fetching employee filters:', error);
    throw new Error(error.message);
  }

  const departments = [...new Set(employees.map((employee) => employee.department))];
  const sites = [...new Set(employees.map((employee) => employee.site))];
  const lifecycles = [...new Set(employees.map((employee) => employee.lifecycle))];
  const statuses = [...new Set(employees.map((employee) => employee.status))];

  return { departments, sites, lifecycles, statuses };
};

const useEmployeeFilters = () => {
  return useQuery({
    queryKey: ['employeeFilters'],
    queryFn: fetchEmployeeFilters,
  });
};

// Add useOwnEmployeeData hook
const useOwnEmployeeData = () => {
  return useQuery({
    queryKey: ['ownEmployeeData'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching own employee data:', error);
        throw new Error(error.message);
      }

      return data;
    },
  });
};

export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  site: string;
  salary: number;
  hourly_rate?: number;
  start_date: string;
  lifecycle: string;
  status: string;
  avatar?: string;
  location?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  user_id?: string;
  manager_id?: string;
  role?: string;
  email?: string;
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

const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();

  if (error) {
    console.error('Error adding employee:', error);
    throw new Error(error.message);
  }

  return data;
};

const useAddEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

const updateEmployee = async (employeeData: Employee) => {
  const { id, ...updates } = employeeData;
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating employee:', error);
    throw new Error(error.message);
  }

  return data;
};

const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

const deleteEmployee = async (id: string) => {
  const { data, error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting employee:', error);
    throw new Error(error.message);
  }

  return data;
};

const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export { useEmployees, useEmployeeFilters, useOwnEmployeeData, useAddEmployee, useUpdateEmployee, useDeleteEmployee };
