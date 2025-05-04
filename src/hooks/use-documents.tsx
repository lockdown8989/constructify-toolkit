
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
        
        // Check if the 'documents' bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error('Error checking buckets:', bucketsError);
          throw bucketsError;
        }
        
        const documentsBucket = buckets.find(b => b.name === 'documents');
        
        if (!documentsBucket) {
          console.log('Documents bucket not found. Creating it now...');
          const { error: createError } = await supabase.storage.createBucket('documents', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (createError) {
            console.error('Error creating documents bucket:', createError);
            throw createError;
          }
        }
        
        // Format file path
        const fileExt = file.name.split('.').pop();
        const filePath = `${employeeId}/${documentType}_${Date.now()}.${fileExt}`;
        
        console.log("Uploading file to path:", filePath);
        
        // Upload file
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        
        console.log("File uploaded successfully:", uploadData);
        
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
            uploaded_by: user?.id
          })
          .select()
          .single();
        
        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
        
        console.log("Document metadata saved successfully:", data);
        
        // Trigger webhook to notify employee
        try {
          const response = await supabase.functions.invoke('notify-on-document-upload', {
            body: { document_id: data.id, employee_id: employeeId }
          });
          console.log("Notification webhook response:", response);
        } catch (webhookError) {
          console.error("Failed to trigger notification webhook:", webhookError);
          // Continue even if the notification fails
        }
        
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
