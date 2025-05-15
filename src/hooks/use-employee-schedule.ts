
import { useState } from 'react';
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
  location?: string;
  updated_at?: string;
  mobile_notification_sent: boolean;
  created_platform: string;
  last_modified_platform: string;
}

export const useEmployeeSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("my-shifts");
  const [newSchedules, setNewSchedules] = useState<Record<string, boolean>>({});
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
        created_at: "2025-05-10T10:00:00",
        location: "Main Office",
        updated_at: "2025-05-10T10:00:00",
        mobile_notification_sent: false,
        created_platform: "web",
        last_modified_platform: "web"
      },
      {
        id: "2",
        title: "Evening Shift",
        employee_id: user?.id || "",
        start_time: "2025-05-18T16:00:00",
        end_time: "2025-05-18T23:00:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00",
        location: "Main Office",
        updated_at: "2025-05-10T10:00:00",
        mobile_notification_sent: false,
        created_platform: "web",
        last_modified_platform: "web"
      },
      {
        id: "3",
        title: "Staff Meeting",
        employee_id: user?.id || "",
        start_time: "2025-05-20T14:00:00",
        end_time: "2025-05-20T15:30:00",
        status: "confirmed",
        created_at: "2025-05-10T10:00:00",
        location: "Conference Room",
        updated_at: "2025-05-10T10:00:00",
        mobile_notification_sent: false,
        created_platform: "web",
        last_modified_platform: "web"
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
    currentDate,
    setCurrentDate,
    selectedScheduleId,
    setSelectedScheduleId,
    isInfoDialogOpen,
    setIsInfoDialogOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    activeTab,
    setActiveTab,
    newSchedules,
    schedules: data || [],
    isLoading,
    error,
    refreshSchedules,
    refetch
  };
};
