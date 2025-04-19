
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_entity: string;
  related_id: string;
  created_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  meeting_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNotification {
  id: string;
  receiver_id: string;
  sender_id: string | null;
  message: string;
  read: boolean;
  status: string;
  type: string;
  created_at: string;
}
