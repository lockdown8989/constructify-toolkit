
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeLocation {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
  is_within_restriction: boolean;
  restriction_id: string | null;
  employee_name?: string;
}

export const useEmployeeLocations = () => {
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployeeLocations = async () => {
    try {
      setIsLoading(true);
      
      // Get recent employee locations (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('employee_location_logs')
        .select(`
          *,
          employees!inner(name)
        `)
        .gte('recorded_at', twentyFourHoursAgo.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      // Get the most recent location for each employee
      const latestLocations = new Map();
      data?.forEach(location => {
        if (!latestLocations.has(location.employee_id) || 
            new Date(location.recorded_at) > new Date(latestLocations.get(location.employee_id).recorded_at)) {
          latestLocations.set(location.employee_id, {
            ...location,
            employee_name: location.employees?.name
          });
        }
      });

      setEmployeeLocations(Array.from(latestLocations.values()));
    } catch (error) {
      console.error('Error fetching employee locations:', error);
      toast({
        title: "Error",
        description: "Failed to load employee locations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logEmployeeLocation = async (
    employeeId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    attendanceId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('employee_location_logs')
        .insert([{
          employee_id: employeeId,
          latitude,
          longitude,
          accuracy,
          attendance_id: attendanceId
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh locations after logging new one
      fetchEmployeeLocations();
      
      return data;
    } catch (error) {
      console.error('Error logging employee location:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployeeLocations();
    
    // Set up real-time subscription for new location logs
    const subscription = supabase
      .channel('employee_locations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'employee_location_logs'
      }, () => {
        fetchEmployeeLocations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    employeeLocations,
    isLoading,
    logEmployeeLocation,
    refetch: fetchEmployeeLocations
  };
};
