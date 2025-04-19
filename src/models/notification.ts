
export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_entity: string; 
  related_id: string; 
}

export interface NotificationResult {
  success: boolean;
  message: string;
  data?: any;
}
