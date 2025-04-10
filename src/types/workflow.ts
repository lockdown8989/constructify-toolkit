
// Custom workflow types that don't rely on Supabase's generated types
// This avoids the errors we're seeing with the workflow_notifications and workflow_requests tables

// Define workflow notification type
export interface WorkflowNotification {
  id: string;
  sender_id: string | null;
  receiver_id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  read: boolean;
}

// Define workflow request type
export interface WorkflowRequest {
  id: string;
  user_id: string;
  request_type: string;
  details: any; // Using 'any' for the JSONB field
  status: string;
  submitted_at: string;
  reviewed_by?: string | null;
}

// Helper to safely cast database results
export function castDatabaseResult<T>(result: any): T {
  return result as unknown as T;
}
