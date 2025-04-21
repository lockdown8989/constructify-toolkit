
import React, { useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { EmployeeDocument } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { sendDocumentUploadNotification } from '@/services/notifications/document-notifications';

interface DocumentListProps {
  documents: EmployeeDocument[];
  isLoading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, isLoading }) => {
  const { toast } = useToast();
  const { isManager, user } = useAuth();
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

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
      // You could use a callback or query invalidation here
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

  const handleDocumentClick = async (doc: EmployeeDocument) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast({
        title: "Document not available",
        description: "This document has not been uploaded yet.",
        variant: "destructive"
      });
    }
  };

  const isUploadingType = (docType: string) => {
    return uploading[docType] || false;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {isLoading ? (
        <div className="col-span-2 py-4 text-center">
          <div className="animate-pulse">Loading documents...</div>
        </div>
      ) : (
        documents.map((doc, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-center p-3 bg-gray-100 rounded-xl",
              doc.url ? "cursor-pointer hover:bg-gray-200" : "opacity-70",
              "transition-colors"
            )}
            onClick={() => doc.url && handleDocumentClick(doc)}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mr-3",
              doc.type === 'contract' ? "bg-blue-100 text-blue-700" : 
              "bg-green-100 text-green-700"
            )}>
              {doc.type === 'contract' ? 'C' : 'P'}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{doc.name.split('_')[0]}</div>
              <div className="text-xs text-gray-500 flex items-center">
                {doc.size}
                {doc.url && (
                  <Download className="h-3 w-3 ml-1 text-gray-400" />
                )}
              </div>
            </div>
            {isManager && !doc.url && (
              <label className={cn(
                "cursor-pointer p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors",
                isUploadingType(doc.type) && "opacity-50 cursor-wait"
              )}>
                {isUploadingType(doc.type) ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                ) : (
                  <Upload className="h-5 w-5 text-gray-600" />
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, doc.type as 'contract' | 'payslip', doc.employeeId)}
                  disabled={isUploadingType(doc.type)}
                  accept=".pdf,.doc,.docx"
                />
              </label>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentList;
