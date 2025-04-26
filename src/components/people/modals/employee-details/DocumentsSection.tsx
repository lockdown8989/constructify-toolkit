import React, { useState } from 'react';
import { FileText, Download, Upload, File, Loader2, Trash2 } from 'lucide-react';
import { Employee } from '@/components/people/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployeeDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents';

interface DocumentsSectionProps {
  employee: Employee;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employee }) => {
  const { isManager, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  
  // Use the custom hooks for documents
  const { data: documents = [], isLoading } = useEmployeeDocuments(employee.id);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  // Check if current user is the employee viewing their own documents
  const isOwnProfile = user?.id === employee.userId;
  
  // Placeholder documents for empty state (only show to managers)
  const getPlaceholderDocuments = () => {
    if (!isManager) return [];
    
    const placeholders = [];
    const hasContract = documents?.some(doc => doc.document_type?.toLowerCase() === 'contract');
    const hasPayslip = documents?.some(doc => doc.document_type?.toLowerCase() === 'payslip');
    
    if (!hasContract) {
      placeholders.push({ 
        id: 'contract-placeholder', 
        name: 'Contract', 
        document_type: 'contract', 
        size: '0 KB',
        icon: <img src="/word-icon.png" alt="Word" className="w-8 h-8" />,
        bgColor: 'bg-blue-50'
      });
    }
    
    if (!hasPayslip) {
      placeholders.push({ 
        id: 'payslip-placeholder', 
        name: 'Payslip', 
        document_type: 'payslip', 
        size: '0 KB',
        icon: <img src="/pdf-icon.png" alt="PDF" className="w-8 h-8" />,
        bgColor: 'bg-green-50'
      });
    }
    
    return placeholders;
  };

  // Only show upload/delete controls to managers
  const showManagementControls = isManager;
  
  // Combine actual documents with placeholders (for managers only)
  const allDocuments = [
    ...documents.map(doc => ({
      ...doc,
      icon: getDocumentIcon(doc.document_type),
      bgColor: getDocumentBgColor(doc.document_type)
    })),
    ...(showManagementControls ? getPlaceholderDocuments() : [])
  ];

  // Helper functions to get document display properties
  function getDocumentIcon(docType: string) {
    const type = docType?.toLowerCase();
    
    if (type?.includes('contract')) {
      return <img src="/word-icon.png" alt="Word" className="w-8 h-8" onError={(e) => {
        e.currentTarget.src = '';
        e.currentTarget.onerror = null;
      }} />;
    } else if (type?.includes('payslip')) {
      return <img src="/pdf-icon.png" alt="PDF" className="w-8 h-8" onError={(e) => {
        e.currentTarget.src = '';
        e.currentTarget.onerror = null;
      }} />;
    } 
    
    return <FileText className="w-8 h-8 text-gray-500" />;
  }
  
  function getDocumentBgColor(docType: string) {
    const type = docType?.toLowerCase();
    
    if (type?.includes('contract')) {
      return 'bg-blue-50';
    } else if (type?.includes('payslip')) {
      return 'bg-green-50';
    }
    
    return 'bg-gray-50';
  }
  
  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    try {
      setUploading(true);
      await uploadDocument.mutateAsync({ 
        file, 
        employeeId: employee.id, 
        documentType: docType 
      });
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };
  
  // Handle document download or delete
  const handleDocumentAction = async (doc: any, action: 'download' | 'delete') => {
    if (action === 'download') {
      if (!doc.url && !doc.path) {
        toast({
          title: "Document not available",
          description: "This document hasn't been uploaded yet.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        let url = doc.url;
        
        // Get the URL if not already available
        if (doc.path && !url) {
          const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(doc.path);
            
          url = data.publicUrl;
        }
        
        // Open the document in a new tab
        if (url) {
          window.open(url, '_blank');
        } else {
          throw new Error('Document URL not available');
        }
      } catch (error) {
        console.error('Error downloading document:', error);
        toast({
          title: "Download failed",
          description: "Failed to download the document",
          variant: "destructive"
        });
      }
    } else if (action === 'delete' && isManager && doc.id && !doc.id.includes('placeholder')) {
      try {
        await deleteDocument.mutateAsync({
          id: doc.id,
          path: doc.path,
          employeeId: employee.id
        });
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">Documents</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-apple-gray-500" />
            <span className="text-apple-gray-500">Loading documents...</span>
          </div>
        </div>
      ) : allDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents available
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {allDocuments.map((doc) => (
            <div 
              key={doc.id}
              className={`relative group p-4 rounded-2xl ${doc.bgColor || 'bg-gray-50'} hover:bg-opacity-80 transition-colors ${uploading ? 'pointer-events-none opacity-60' : ''} flex items-center`}
              onClick={() => {
                if (doc.path) {
                  handleDocumentAction(doc, 'download');
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
              
              <div className="flex items-center space-x-2">
                {showManagementControls && (!doc.path || doc.id.includes('placeholder')) ? (
                  <label className={`cursor-pointer p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                    ) : (
                      <Upload className="h-5 w-5 text-gray-600" />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleDocumentUpload(e, doc.document_type)}
                      disabled={uploading}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                ) : (
                  <>
                    {doc.path && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentAction(doc, 'download');
                        }}
                      >
                        <Download className="h-5 w-5 text-gray-600" />
                      </Button>
                    )}
                    
                    {showManagementControls && doc.path && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentAction(doc, 'delete');
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </>
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
