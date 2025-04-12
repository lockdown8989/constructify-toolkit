
import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, File } from 'lucide-react';
import { Employee } from '@/components/people/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentsSectionProps {
  employee: Employee;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'resume' | 'payslip';
  size: string;
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
          size: '0 KB' 
        });
      }
      
      if (!hasResume) {
        formattedDocs.push({ 
          id: 'resume-placeholder', 
          name: 'Resume', 
          type: 'resume', 
          size: '0 KB' 
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
                
            formattedDocs.push({
              id: doc.id,
              name: doc.name,
              type: type as 'contract' | 'resume' | 'payslip',
              size: doc.size || `0 KB`,
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
  
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'contract' | 'resume') => {
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
  
  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'contract':
        return "bg-blue-50 text-blue-700";
      case 'resume':
        return "bg-green-50 text-green-700";
      case 'payslip':
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">Documents</h3>
        {isManager && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-8 rounded-full bg-apple-gray-50 border-apple-gray-200 text-apple-gray-800 hover:bg-apple-gray-100"
            disabled={uploading}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-apple-gray-500">Loading documents...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="relative group p-3.5 rounded-xl bg-apple-gray-50 hover:bg-apple-gray-100/90 transition-colors cursor-pointer"
              onClick={() => {
                if (!isManager || doc.url) {
                  handleDocumentDownload(doc);
                }
              }}
            >
              <div className="flex items-center">
                <div className={`p-2.5 rounded-lg ${getDocumentColor(doc.type)} mr-3 flex-shrink-0`}>
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-apple-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-apple-gray-500">{doc.size}</p>
                </div>
                {isManager && !doc.url ? (
                  <label className="cursor-pointer p-2 rounded-full hover:bg-apple-gray-200/50 transition-colors">
                    <Upload className="h-4 w-4 text-apple-gray-600" />
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
                    <div className="p-2 rounded-full hover:bg-apple-gray-200/50 transition-colors">
                      <Download className="h-4 w-4 text-apple-gray-600" />
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
