
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type DocumentModel = {
  id: string;
  name: string;
  document_type: string;
  url?: string;
  path?: string;
  size?: string;
  employee_id?: string;
};

export function useEmployeeDocuments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', employeeId);
        
      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
      
      return docs as DocumentModel[];
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
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      // Save document metadata
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: employeeId,
          name: file.name,
          document_type: documentType,
          path: filePath,
          url: urlData.publicUrl,
          size: sizeString
        })
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', variables.employeeId] });
      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully.",
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
