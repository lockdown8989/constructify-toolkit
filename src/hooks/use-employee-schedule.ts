
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth";

export interface EmployeeSchedule {
  id: string;
  title: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

export const useEmployeeSchedule = () => {
  const { user } = useAuth();
  
  // In a real app, this would fetch from an API/database
  const fetchSchedules = async (): Promise<EmployeeSchedule[]> => {
    // This is mock data - in a real app, you'd fetch from Supabase or another backend
    return [
      {
        id: "1",
        title: "Morning Shift",
        employee_id: user?.id || "",
        start_time: "2025-05-16T08:00:00",
        end_time: "2025-05-16T16:00:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00"
      },
      {
        id: "2",
        title: "Evening Shift",
        employee_id: user?.id || "",
        start_time: "2025-05-18T16:00:00",
        end_time: "2025-05-18T23:00:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00"
      },
      {
        id: "3",
        title: "Staff Meeting",
        employee_id: user?.id || "",
        start_time: "2025-05-20T14:00:00",
        end_time: "2025-05-20T15:30:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00"
      }
    ];
  };
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['employeeSchedules', user?.id],
    queryFn: fetchSchedules,
    enabled: !!user?.id
  });
  
  const refreshSchedules = () => {
    refetch();
  };
  
  return {
    schedules: data || [],
    isLoading,
    error,
    refreshSchedules
  };
};
