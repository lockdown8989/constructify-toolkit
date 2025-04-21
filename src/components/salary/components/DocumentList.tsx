
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { EmployeeDocument } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { sendDocumentUploadNotification } from '@/services/notifications/document-notifications';
import DocumentUploadCard from './DocumentUploadCard';

interface DocumentListProps {
  documents: EmployeeDocument[];
  isLoading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, isLoading }) => {
  const { toast } = useToast();
  const { isManager, user } = useAuth();
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  // Find documents by type
  const contractDoc = documents.find(doc => doc.type === 'contract');
  const payslipDoc = documents.find(doc => doc.type === 'payslip');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'contract' | 'payslip', employeeId?: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Set uploading state for this specific document type
    setUploading(prev => ({ ...prev, [docType]: true }));

    try {
      // Generate a more descriptive filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExt = file.name.split('.').pop();
      const sanitizedFilename = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${docType}_${sanitizedFilename}_${timestamp}.${fileExt}`;
      
      // Create folder structure: documents/{employeeId}/{documentType}/
      const filePath = `${employeeId || 'general'}/${docType}/${fileName}`;
      
      // Upload file to storage bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded document');
      }

      // Create document record
      const { error: dbError, data: documentData } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          document_type: docType,
          path: filePath,
          url: urlData.publicUrl,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          employee_id: employeeId,
          access_level: 'private',
          uploaded_by: user?.id,
          uploaded_by_role: isManager ? 'employer' : 'employee'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Send notification to the employee
      if (employeeId) {
        const notificationSent = await sendDocumentUploadNotification(
          employeeId,
          docType,
          file.name
        );
        
        if (!notificationSent) {
          console.warn('Failed to send document upload notification');
        }
      }

      toast({
        title: "Upload successful",
        description: `${docType.charAt(0).toUpperCase() + docType.slice(1)} has been uploaded successfully.`
      });
      
      // Refresh the document list - this would need to be implemented by the parent component
      window.location.reload(); // Simple refresh to show updated documents
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {isLoading ? (
        <div className="col-span-1 py-4 text-center">
          <div className="animate-pulse">Loading documents...</div>
        </div>
      ) : (
        <>
          {isManager && (
            <DocumentUploadCard
              type="contract"
              size={contractDoc?.size || '0 KB'}
              fileName={contractDoc?.name}
              onUpload={(e) => handleFileUpload(
                e, 
                'contract', 
                documents[0]?.employeeId
              )}
              isUploading={uploading['contract']}
              disabled={uploading['payslip']} // Disable when other is uploading
            />
          )}
          {isManager && (
            <DocumentUploadCard
              type="payslip"
              size={payslipDoc?.size || '0 KB'}
              fileName={payslipDoc?.name}
              onUpload={(e) => handleFileUpload(
                e, 
                'payslip', 
                documents[0]?.employeeId
              )}
              isUploading={uploading['payslip']}
              disabled={uploading['contract']} // Disable when other is uploading
            />
          )}
        </>
      )}
    </div>
  );
};

export default DocumentList;
