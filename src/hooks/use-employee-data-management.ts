
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export const useEmployeeDataManagement = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user) {
        setIsLoading(false);
        setError('No authenticated user');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (employeeError) {
          console.error('Error fetching employee data:', employeeError);
          setError('Failed to fetch employee data');
          return;
        }

        if (employeeData) {
          setEmployeeId(employeeData.id);
          setEmployeeData(employeeData);
        } else {
          console.log('No employee record found for user:', user.id);
          setError('No employee record found');
        }
      } catch (err) {
        console.error('Exception in fetchEmployeeData:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [user?.id]);

  // Reset state when user is null (logged out or deleted)
  useEffect(() => {
    if (!user) {
      setEmployeeId(null);
      setEmployeeData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [user]);

  return {
    employeeId,
    employeeData,
    isLoading,
    error
  };
};
