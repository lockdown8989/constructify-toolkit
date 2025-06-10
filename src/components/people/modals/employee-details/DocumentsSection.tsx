
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, Plus, Eye } from 'lucide-react';
import { useEmployeeDocuments, useDeleteDocument, type DocumentModel } from '@/hooks/use-documents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DocumentAssignmentDialog from './DocumentAssignmentDialog';

interface DocumentsSectionProps {
  employeeId: string;
  employeeName: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  employeeId,
  employeeName
}) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { data: documents = [], isLoading } = useEmployeeDocuments(employeeId);
  const deleteDocument = useDeleteDocument();
  const { toast } = useToast();

  const handleDownload = async (doc: DocumentModel) => {
    if (!doc.path) {
      toast({
        title: "Download Error",
        description: "Document path not found",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(doc.path);
        
      if (error) throw error;
      
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the document",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (doc: DocumentModel) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocument.mutateAsync({
        id: doc.id,
        path: doc.path,
        employeeId
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleView = async (doc: DocumentModel) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast({
        title: "View Error",
        description: "Document URL not available",
        variant: "destructive"
      });
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      contract: 'bg-blue-100 text-blue-800',
      payslip: 'bg-green-100 text-green-800',
      p60: 'bg-purple-100 text-purple-800',
      certificate: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Documents</h3>
        </div>
        <div className="text-center py-8 text-gray-500">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
        <Button 
          onClick={() => setIsAssignDialogOpen(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Assign Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents</h4>
          <p className="text-gray-500 mb-4">
            No documents have been assigned to this employee yet.
          </p>
          <Button 
            onClick={() => setIsAssignDialogOpen(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign First Document
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {doc.title}
                      </h4>
                      <Badge className={getDocumentTypeColor(doc.category || doc.document_type || 'general')}>
                        {doc.category || doc.document_type}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      {doc.size && (
                        <span>{doc.size}</span>
                      )}
                      {doc.created_at && (
                        <span>
                          Added {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(doc)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {doc.path && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deleteDocument.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DocumentAssignmentDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        employeeId={employeeId}
        employeeName={employeeName}
      />
    </div>
  );
};

export default DocumentsSection;
