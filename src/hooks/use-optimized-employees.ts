import { useMemo } from 'react';
import { useEmployees } from '@/hooks/use-employees';
import { useAuth } from '@/hooks/use-auth';
import { Employee as DBEmployee } from '@/hooks/use-employees';
import { Employee } from '@/components/people/types';

interface OptimizedEmployeeData {
  employeeData: DBEmployee | null;
  employeeId: string | null;
  allEmployees: DBEmployee[];
  isLoading: boolean;
  error: any;
  employeeCount: number;
  activeEmployees: DBEmployee[];
  inactiveEmployees: DBEmployee[];
}

export const useOptimizedEmployees = (): OptimizedEmployeeData => {
  const { data: employees = [], isLoading, error } = useEmployees();
  const { user } = useAuth();

  // Memoized computations for performance
  const memoizedData = useMemo(() => {
    // Find current user's employee record
    const currentEmployee = user && employees.length > 0
      ? employees.find(emp => emp.user_id === user.id) || null
      : null;

    // Split employees by status for optimized rendering
    const activeEmployees = employees.filter(emp => 
      emp.status === 'Active' || emp.lifecycle === 'Active'
    );
    
    const inactiveEmployees = employees.filter(emp => 
      emp.status !== 'Active' && emp.lifecycle !== 'Active'
    );

    return {
      employeeData: currentEmployee,
      employeeId: currentEmployee?.id || null,
      allEmployees: employees,
      employeeCount: employees.length,
      activeEmployees,
      inactiveEmployees,
    };
  }, [employees, user]);

  return {
    ...memoizedData,
    isLoading,
    error,
  };
};

// Virtual scrolling helper for large employee lists
export const useVirtualizedEmployees = (employees: DBEmployee[], itemHeight = 80) => {
  return useMemo(() => {
    const getItemSize = () => itemHeight;
    const getItemOffset = (index: number) => index * itemHeight;
    const getVisibleRange = (scrollTop: number, containerHeight: number) => {
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(containerHeight / itemHeight) + 1,
        employees.length
      );
      return { start, end };
    };

    return {
      getItemSize,
      getItemOffset,
      getVisibleRange,
      totalHeight: employees.length * itemHeight,
    };
  }, [employees.length, itemHeight]);
};