
import React from "react";
import WebhookConfig from "@/components/notifications/WebhookConfig";
import { useAuth } from "@/hooks/use-auth";

const NotificationsTab: React.FC = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerAccess = isManager || isAdmin || isHR;

  if (!hasManagerAccess) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        You don't have permission to access this view.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <WebhookConfig />
    </div>
  );
};

export default NotificationsTab;
