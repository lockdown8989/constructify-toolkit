
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { uploadEmployeeDocument } from '@/utils/exports/document-manager';

export type DocumentModel = {
  id: string;
  name: string;
  document_type: string;
  url?: string;
  path?: string;
  size?: string;
  employee_id?: string;
  created_at?: string;
};

export function useEmployeeDocuments(employeeId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      console.log('Fetching documents for employee:', employeeId);
      
      try {
        // First check if the documents bucket exists via edge function
        try {
          await supabase.functions.invoke('check-storage-bucket');
        } catch (bucketError) {
          console.warn('Could not check bucket via edge function, continuing with direct query:', bucketError);
        }
        
        // Attempt to call the edge function first for better document retrieval
        try {
          const { data: functionData, error: functionError } = await supabase.functions
            .invoke('get-employee-documents', {
              body: { employeeId, documentType: 'all' }
            });
            
          if (!functionError && functionData?.success && Array.isArray(functionData.data)) {
            console.log(`Found ${functionData.data.length} documents via edge function`);
            return functionData.data as DocumentModel[];
          } else if (functionError) {
            console.error('Edge function error:', functionError);
          }
        } catch (funcError) {
          console.warn('Edge function call failed, falling back to direct query:', funcError);
        }
        
        // Fallback to direct query with improved selection
        const { data: docs, error } = await supabase
          .from('documents')
          .select('*')
          .eq('employee_id', employeeId);
          
        if (error) {
          console.error('Error fetching documents:', error);
          throw error;
        }
        
        console.log(`Found ${docs?.length || 0} documents for employee via direct query`);
        
        if (!docs || docs.length === 0) {
          return [];
        }
        
        // Add public URLs for documents if they're missing
        const docsWithUrls = await Promise.all(docs.map(async (doc) => {
          if (doc.path && !doc.url) {
            try {
              const { data } = supabase.storage
                .from('documents')
                .getPublicUrl(doc.path);
                
              // Update the document with the URL in the database
              if (data.publicUrl) {
                await supabase
                  .from('documents')
                  .update({ url: data.publicUrl })
                  .eq('id', doc.id);
                  
                return {
                  ...doc,
                  url: data.publicUrl
                };
              }
            } catch (urlError) {
              console.error(`Error getting URL for document ${doc.id}:`, urlError);
            }
          }
          return doc;
        }));
        
        console.log('Documents after URL processing:', docsWithUrls);
        return docsWithUrls as DocumentModel[];
      } catch (error) {
        console.error("Error in useEmployeeDocuments:", error);
        toast({
          title: "Error loading documents",
          description: "Failed to retrieve your documents. Please try again later.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!employeeId,
    refetchInterval: 10000, // Refetch every 10 seconds to check for new documents
    retry: 3,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      file, 
      employeeId, 
      documentType 
    }: { 
      file: File; 
      employeeId: string; 
      documentType: string;
    }) => {
      try {
        console.log("Starting document upload:", { documentType, employeeId, fileName: file.name });
        
        // First ensure the storage bucket exists
        try {
          await supabase.functions.invoke('check-storage-bucket');
        } catch (bucketError) {
          console.warn('Storage bucket check failed, attempting upload anyway:', bucketError);
        }
        
        const result = await uploadEmployeeDocument(
          employeeId,
          file,
          documentType as any
        );
        
        if (!result.success) {
          console.error("Upload failed:", result.error);
          throw new Error(result.error);
        }
        
        return result;
      } catch (error) {
        console.error("Error in upload document mutation:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      console.log("Document upload successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['employee-documents', variables.employeeId] });
      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully.",
      });
    },
    onError: (error) => {
      console.error("Final error in mutation:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, path, employeeId }: { id: string; path?: string; employeeId: string }) => {
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([path]);
          
        if (storageError) throw storageError;
      }
      
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      return { id, employeeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', data.employeeId] });
      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive"
      });
    }
  });
}

// Create a new hook to handle document assignments
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
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
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
