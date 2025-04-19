
import React, { useEffect } from "react";
import { useLeaveRealtime } from "@/hooks/leave/use-leave-realtime";
import { setupRealtimeSubscriptions } from "@/services/setup-realtime";
import { useAuth } from "@/hooks/use-auth";

const LeaveRealtimeUpdates: React.FC = () => {
  const { user } = useAuth();
  
  // The hook handles all the real-time updates subscription logic for leave requests
  useLeaveRealtime();
  
  // Set up realtime subscriptions for shifts and schedules
  useEffect(() => {
    if (user) {
      setupRealtimeSubscriptions();
    }
  }, [user]);
  
  // Component doesn't render anything, it just sets up the subscription
  return null;
};

export default LeaveRealtimeUpdates;
