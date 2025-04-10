
import React from "react";
import ApprovalDashboard from "./approval/ApprovalDashboard";
import RealtimeUpdates from "./approval/RealtimeUpdates";

const LeaveApprovalDashboard: React.FC = () => {
  return (
    <>
      <RealtimeUpdates />
      <ApprovalDashboard />
    </>
  );
};

export default LeaveApprovalDashboard;
