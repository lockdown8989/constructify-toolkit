
import React from "react";
import { useLeaveRealtime } from "@/hooks/leave/use-leave-realtime";

const LeaveRealtimeUpdates: React.FC = () => {
  useLeaveRealtime();
  return null;
};

export default LeaveRealtimeUpdates;
