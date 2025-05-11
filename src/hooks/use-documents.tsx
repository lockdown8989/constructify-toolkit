
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
  created_at?: string;
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
      
      // Add public URLs for documents
      const docsWithUrls = await Promise.all(docs.map(async (doc) => {
        if (doc.path) {
          const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(doc.path);
            
          return {
            ...doc,
            url: data.publicUrl
          };
        }
        return doc;
      }));
      
      return docsWithUrls as DocumentModel[];
    },
    enabled: !!employeeId
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
        
        // First check if documents bucket exists
        await checkStorageBucket();
        
        // Format file path
        const fileExt = file.name.split('.').pop();
        const timestamp = new Date().getTime();
        const fileName = `${documentType}_${timestamp}.${fileExt}`;
        const filePath = `${employeeId}/${fileName}`;
        
        console.log("Uploading file to path:", filePath);
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
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
          
        console.log("File public URL:", urlData.publicUrl);
        
        // Save document metadata
        const { data, error: dbError } = await supabase
          .from('documents')
          .insert({
            employee_id: employeeId,
            name: file.name,
            document_type: documentType,
            path: filePath,
            url: urlData.publicUrl,
            size: sizeString,
            uploaded_by: user?.id || null
          })
          .select()
          .single();
        
        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
        
        console.log("Document metadata saved successfully:", data);
        
        return data;
      } catch (error) {
        console.error("Error in upload document mutation:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
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

// Helper function to check if documents bucket exists
async function checkStorageBucket() {
  try {
    // First check if the bucket exists using the edge function
    const { error } = await supabase.functions.invoke('check-storage-bucket');
    
    if (error) {
      console.error('Error checking storage bucket:', error);
      throw new Error('Failed to check storage bucket');
    }
  } catch (error) {
    console.error('Failed to check storage bucket:', error);
    throw error;
  }
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
