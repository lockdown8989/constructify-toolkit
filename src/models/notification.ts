
/**
 * Data required to create a notification
 */
export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_entity?: string;
  related_id?: string;
}

/**
 * Full notification model with database fields
 */
export interface Notification extends NotificationData {
  id: string;
  read: boolean;
  created_at: string;
}

/**
 * Result of a notification operation
 */
export interface NotificationResult {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}
