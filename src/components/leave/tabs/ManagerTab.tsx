
import React from "react";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import { useAuth } from "@/hooks/use-auth";

const ManagerTab: React.FC = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerAccess = isManager || isAdmin || isHR;

  if (!hasManagerAccess) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        You don't have permission to access this view.
      </div>
    );
  }

  return <LeaveApprovalDashboard />;
};

export default ManagerTab;
