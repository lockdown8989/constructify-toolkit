
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { assignDocumentToEmployee } from '@/services/notifications/document-notifications';

export interface DocumentAssignment {
  id: string;
  document_id: string;
  employee_id: string;
  status: string;
  assigned_at: string;
  due_date: string | null;
  completed_at: string | null;
  viewed_at: string | null;
  is_required: boolean;
  assigned_by: string | null;
}

export const useDocumentAssignments = (employeeId?: string) => {
  return useQuery({
    queryKey: ['document-assignments', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('document_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

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
  });
};

export const useAssignDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      documentId,
      employeeId,
      dueDate,
      isRequired = false,
      documentName
    }: {
      documentId: string;
      employeeId: string;
      dueDate?: string;
      isRequired?: boolean;
      documentName: string;
    }) => {
      // Insert the assignment
      const { data, error } = await supabase
        .from('document_assignments')
        .insert({
          document_id: documentId,
          employee_id: employeeId,
          due_date: dueDate || null,
          is_required: isRequired,
          assigned_by: (await supabase.auth.getUser()).data.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to employee
      try {
        await assignDocumentToEmployee(employeeId, documentName, dueDate);
      } catch (notificationError) {
        console.warn('Failed to send document assignment notification:', notificationError);
        // Don't fail the entire operation if notification fails
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-assignments'] });
      toast({
        title: "Document assigned",
        description: "The document has been assigned to the employee.",
      });
    },
    onError: (error) => {
      console.error('Error assigning document:', error);
      toast({
        title: "Error assigning document",
        description: error instanceof Error ? error.message : "Failed to assign document",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDocumentAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      completedAt,
      viewedAt
    }: {
      id: string;
      status?: string;
      completedAt?: string;
      viewedAt?: string;
    }) => {
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (completedAt) updateData.completed_at = completedAt;
      if (viewedAt) updateData.viewed_at = viewedAt;

      const { data, error } = await supabase
        .from('document_assignments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-assignments'] });
      toast({
        title: "Assignment updated",
        description: "Document assignment has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating document assignment:', error);
      toast({
        title: "Error updating assignment",
        description: error instanceof Error ? error.message : "Failed to update assignment",
        variant: "destructive",
      });
    },
  });
};
