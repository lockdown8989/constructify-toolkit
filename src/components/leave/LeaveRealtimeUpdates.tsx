
import React from "react";
import { useLeaveRealtime } from "@/hooks/leave/use-leave-realtime";

const LeaveRealtimeUpdates: React.FC = () => {
  // The hook handles all the real-time updates subscription logic
  useLeaveRealtime();
  
  // Component doesn't render anything, it just sets up the subscription
  return null;
};

export default LeaveRealtimeUpdates;
