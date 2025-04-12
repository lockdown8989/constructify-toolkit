
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentModel } from '@/types/database';

export function useEmployeeDocuments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      try {
        // Check if edge function exists
        const { data: docsFunctionData, error: funcError } = await supabase.functions.invoke('get-employee-documents', {
          body: { employeeId }
        });
        
        if (funcError) {
          throw funcError;
        }
        
        if (docsFunctionData?.success && docsFunctionData?.data) {
          return docsFunctionData.data as DocumentModel[];
        }
        
        // Fallback to direct query if edge function not available
        const { data: docs, error } = await supabase
          .from('documents')
          .select('*')
          .eq('employee_id', employeeId);
          
        if (error) {
          throw error;
        }
        
        return docs as DocumentModel[];
      } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
    },
    enabled: !!employeeId
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
      // Check if storage bucket exists, create if needed
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.some(bucket => bucket.name === 'documents')) {
        await supabase.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${employeeId}/${documentType}_${Date.now()}.${fileExt}`;
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get file size in KB or MB
      const sizeInBytes = file.size;
      const sizeString = sizeInBytes < 1024 * 1024
        ? `${Math.round(sizeInBytes / 1024)} KB`
        : `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      
      // Save document metadata
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: employeeId,
          name: file.name,
          document_type: documentType,
          path: filePath,
          size: sizeString
        })
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      return data as DocumentModel;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      
      toast({
        title: "Document uploaded",
        description: `${variables.documentType.charAt(0).toUpperCase() + variables.documentType.slice(1)} uploaded successfully.`,
      });
    },
    onError: (error) => {
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
    mutationFn: async ({ 
      id, 
      path, 
      employeeId 
    }: { 
      id: string; 
      path?: string; 
      employeeId: string;
    }) => {
      // Delete file from storage if path exists
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([path]);
          
        if (storageError) {
          throw storageError;
        }
      }
      
      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (dbError) {
        throw dbError;
      }
      
      return { id, employeeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', data.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.employeeId] });
      
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
