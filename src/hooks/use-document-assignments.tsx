
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { assignDocumentToEmployee } from '@/services/notifications/document-notifications';

export interface DocumentAssignment {
  id: string;
  document_id: string;
  document?: {
    name: string;
    document_type: string;
    path?: string;
    url?: string;
  };
  employee_id: string;
  employee?: {
    name: string;
  };
  assigned_by: string;
  assigned_by_name?: string;
  assigned_at: string;
  viewed_at?: string;
  is_required: boolean;
  due_date?: string;
  status: 'pending' | 'viewed' | 'completed' | 'overdue';
}

export function useDocumentAssignments(employeeId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-assignments', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('document_assignments')
        .select(`
          *,
          document:document_id(id, name, document_type, path, url),
          employee:employee_id(id, name),
          assigned_by_user:assigned_by(id)
        `);
      
      // Filter by employee ID if provided
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching document assignments:', error);
        throw error;
      }
      
      return data as DocumentAssignment[];
    },
    enabled: !!user
  });
}

export function useAssignDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      employeeId, 
      isRequired = false, 
      dueDate 
    }: { 
      documentId: string;
      employeeId: string;
      isRequired?: boolean;
      dueDate?: string;
    }) => {
      const result = await assignDocumentToEmployee(
        documentId,
        employeeId,
        isRequired,
        dueDate
      );
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-assignments'] });
      toast({
        title: "Document assigned",
        description: "Document has been successfully assigned to the employee.",
      });
    },
    onError: (error) => {
      toast({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Failed to assign document",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateDocumentAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      viewedAt 
    }: { 
      id: string;
      status?: string;
      viewedAt?: boolean;
    }) => {
      const updates: any = {};
      
      if (status) {
        updates.status = status;
      }
      
      if (viewedAt) {
        updates.viewed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('document_assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-assignments'] });
      toast({
        title: "Status updated",
        description: "Document assignment status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update document assignment",
        variant: "destructive"
      });
    }
  });
}
