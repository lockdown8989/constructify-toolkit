
import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, File } from 'lucide-react';
import { Employee } from '@/components/people/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentModel } from '@/types/database';

interface DocumentsSectionProps {
  employee: Employee;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'resume' | 'payslip';
  size: string;
  icon?: React.ReactNode;
  bgColor?: string;
  url?: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employee }) => {
  const { isManager, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    fetchDocuments();
  }, [employee.id]);
  
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', employee.id);
      
      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }
      
      const formattedDocs: Document[] = [];
      
      // Create placeholders for missing documents
      const hasContract = docs?.some(doc => doc.document_type?.toLowerCase() === 'contract');
      const hasResume = docs?.some(doc => doc.document_type?.toLowerCase() === 'resume');
      
      if (!hasContract) {
        formattedDocs.push({ 
          id: 'contract-placeholder', 
          name: 'Contract', 
          type: 'contract', 
          size: '0 KB',
          icon: <img src="/word-icon.png" alt="Word" className="w-8 h-8" />,
          bgColor: 'bg-blue-50'
        });
      }
      
      if (!hasResume) {
        formattedDocs.push({ 
          id: 'resume-placeholder', 
          name: 'Resume', 
          type: 'resume', 
          size: '0 KB',
          icon: <img src="/pdf-icon.png" alt="PDF" className="w-8 h-8" />,
          bgColor: 'bg-red-50'
        });
      }
      
      // Add existing documents with public URLs
      if (docs && docs.length > 0) {
        for (const doc of docs) {
          if (doc.path) {
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(doc.path);
              
            const type = doc.document_type?.toLowerCase().includes('contract') 
              ? 'contract' 
              : doc.document_type?.toLowerCase().includes('resume')
                ? 'resume'
                : 'payslip';
                
            let icon = <FileText className="w-8 h-8" />;
            let bgColor = 'bg-gray-50';
            
            if (type === 'contract') {
              icon = <img src="/word-icon.png" alt="Word" className="w-8 h-8" onError={(e) => {
                e.currentTarget.src = '';
                e.currentTarget.onerror = null;
              }} />;
              bgColor = 'bg-blue-50';
            } else if (type === 'resume' || type === 'payslip') {
              icon = <img src="/pdf-icon.png" alt="PDF" className="w-8 h-8" onError={(e) => {
                e.currentTarget.src = '';
                e.currentTarget.onerror = null;
              }} />;
              bgColor = 'bg-red-50';
            }
            
            formattedDocs.push({
              id: doc.id,
              name: doc.name,
              type: type as 'contract' | 'resume' | 'payslip',
              size: doc.size || `0 KB`,
              icon,
              bgColor,
              url: urlData.publicUrl
            });
          }
        }
      }
      
      setDocuments(formattedDocs);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'contract' | 'resume' | 'payslip') => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${employee.id}/${docType}_${Date.now()}.${fileExt}`;
    
    setUploading(true);
    
    try {
      // Check if storage bucket exists, create if needed
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.some(bucket => bucket.name === 'documents')) {
        await supabase.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
      }
      
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
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: employee.id,
          name: file.name,
          document_type: docType,
          path: filePath,
          size: sizeString
        });
      
      if (dbError) {
        throw dbError;
      }
      
      toast({
        title: "Document uploaded",
        description: `${docType.charAt(0).toUpperCase() + docType.slice(1)} uploaded successfully.`,
      });
      
      // Refresh document list
      fetchDocuments();
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['employee', employee.id] });
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleDocumentDownload = async (doc: Document) => {
    if (!doc.url) {
      toast({
        title: "Document not available",
        description: "This document hasn't been uploaded yet.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Open document in new tab
      window.open(doc.url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the document",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="mb-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-apple-gray-500">Loading documents...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className={`relative group p-4 rounded-2xl ${doc.bgColor || 'bg-gray-50'} hover:bg-opacity-80 transition-colors cursor-pointer flex items-center`}
              onClick={() => {
                if (!isManager || doc.url) {
                  handleDocumentDownload(doc);
                }
              }}
            >
              <div className="flex-shrink-0 mr-3">
                {doc.icon || <FileText className="w-8 h-8 text-gray-500" />}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.size}</p>
              </div>
              
              {isManager && !doc.url ? (
                <label className="cursor-pointer p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors">
                  <Upload className="h-5 w-5 text-gray-600" />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleDocumentUpload(e, doc.type)}
                    disabled={uploading}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              ) : (
                doc.url && (
                  <div className="p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors">
                    <Download className="h-5 w-5 text-gray-600" />
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
