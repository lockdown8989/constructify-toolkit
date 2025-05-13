
import React, { useEffect } from "react";
import { useLeaveRealtime } from "@/hooks/leave/use-leave-realtime";
import { setupRealtimeSubscriptions } from "@/services/setup-realtime";
import { useAuth } from "@/hooks/use-auth";

const LeaveRealtimeUpdates: React.FC = () => {
  const { user } = useAuth();
  
  // The hook handles all the real-time updates subscription logic for leave requests
  useLeaveRealtime();
  
  // Set up realtime subscriptions for shifts and schedules once when user loads
  useEffect(() => {
    if (!user) return;
    
    let isSetupComplete = false;
    
    const setupSubscriptions = async () => {
      if (isSetupComplete) return;
      
      await setupRealtimeSubscriptions();
      isSetupComplete = true;
    };
    
    setupSubscriptions();
    
    return () => {
      isSetupComplete = true; // Prevent multiple setups
    };
  }, [user]);
  
  // Component doesn't render anything, it just sets up the subscription
  return null;
};

export default LeaveRealtimeUpdates;
