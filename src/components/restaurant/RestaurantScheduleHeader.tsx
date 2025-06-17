
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import { toast as sonnerToast } from 'sonner';

interface RestaurantScheduleHeaderProps {
  setViewMode: (mode: 'week' | 'day') => void;
}

const RestaurantScheduleHeader = ({ setViewMode }: RestaurantScheduleHeaderProps) => {
  const [syncingData, setSyncingData] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [locationName, setLocationName] = useState("Main Location");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Function to sync with calendar
  const syncWithCalendar = useCallback(() => {
    if (syncingCalendar) return; // Prevent multiple clicks
    
    setSyncingCalendar(true);
    
    // Show syncing toast
    const loadingToast = sonnerToast.loading("Syncing with calendar...");
    
    // Simulate API call for calendar synchronization
    setTimeout(() => {
      setSyncingCalendar(false);
      sonnerToast.dismiss(loadingToast);
      sonnerToast.success("Calendar synchronized successfully");
      
      toast({
        title: "Calendar synchronized",
        description: "All shifts have been synced with your calendar.",
      });
    }, 2000);
  }, [syncingCalendar, toast]);

  const syncEmployeeData = () => {
    if (syncingData) return; // Prevent multiple clicks
    
    setSyncingData(true);
    
    // Show syncing toast
    const loadingToast = sonnerToast.loading("Synchronizing employee data...");
    
    // Simulate API call for data synchronization
    setTimeout(() => {
      setSyncingData(false);
      sonnerToast.dismiss(loadingToast);
      sonnerToast.success("Employee data synchronized");
      
      toast({
        title: "Synchronization complete",
        description: "All employee information has been updated.",
      });
    }, 1500);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="mb-4 sm:mb-6">
      <ScheduleHeader 
        locationName={locationName}  
        setLocationName={setLocationName}  
        setViewMode={setViewMode} 
        onSyncCalendar={syncWithCalendar}
        onSyncEmployeeData={syncEmployeeData}
        isSyncing={syncingData || syncingCalendar}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default RestaurantScheduleHeader;
