
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DocumentAssignment = {
  id: string;
  employee_id: string;
  document_id: string;
  assigned_at: string;
  is_required: boolean;
  due_date?: string;
  status: 'pending' | 'viewed' | 'completed' | 'overdue';
  document?: {
    id: string;
    name: string;
    document_type: string;
    url?: string;
    path?: string;
  };
};

export function useDocumentAssignments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['document-assignments', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('document_assignments')
        .select(`
          id, 
          employee_id, 
          document_id, 
          assigned_at, 
          is_required,
          due_date,
          status,
          document:documents(*)
        `)
        .eq('employee_id', employeeId)
        .order('assigned_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching document assignments:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!employeeId,
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
      try {
        // Use the edge function to handle the document assignment
        const { data, error } = await supabase.functions.invoke('notify-on-document-upload', {
          body: {
            documentId,
            employeeId,
            isRequired,
            dueDate
          }
        });
        
        if (error || !data?.success) {
          throw new Error(error?.message || data?.message || 'Failed to assign document');
        }
        
        return data;
      } catch (error) {
        console.error('Error assigning document:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-assignments', variables.employeeId] });
      toast({
        title: "Document assigned",
        description: "Document has been assigned successfully.",
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
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'viewed' | 'completed' | 'overdue' }) => {
      const { data, error } = await supabase
        .from('document_assignments')
        .update({ status })
        .eq('id', id)
        .select('employee_id')
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-assignments', data.employee_id] });
      toast({
        title: "Status updated",
        description: "Document assignment status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      });
    }
  });
}
