
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents';
import { Card, CardContent } from '@/components/ui/card';
import DocumentUploadSection from './DocumentUploadSection';
import DocumentsList from './DocumentsList';
import AssignDocumentDialog from './AssignDocumentDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DocumentsTabProps {
  employeeId: string;
  onAssignmentComplete: () => void;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ employeeId, onAssignmentComplete }) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [documentType, setDocumentType] = useState('general');
  const [deleting, setDeleting] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    data: documents, 
    isLoading: isLoadingDocuments, 
    refetch: refetchDocuments 
  } = useEmployeeDocuments(employeeId);
  
  const { mutateAsync: uploadDocument } = useUploadDocument();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingFile(true);
    
    try {
      console.log(`Starting upload for ${selectedFiles.length} files, document type: ${documentType}`);
      
      for (const file of selectedFiles) {
        console.log(`Uploading file: ${file.name}`);
        const result = await uploadDocument({
          employeeId,
          file,
          documentType: documentType
        });
        
        if (!result) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
      
      toast({
        title: "Upload successful",
        description: `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} uploaded successfully.`,
      });
      
      setSelectedFiles([]);
      refetchDocuments();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file(s). Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    setDeleting(id);
    
    try {
      await deleteDocument({
        id,
        employeeId
      });
      
      toast({
        title: "Document deleted",
        description: "The document was successfully deleted.",
      });
      
      refetchDocuments();
      onAssignmentComplete();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };
  
  return (
    <Card className="border-none">
      <CardContent className="p-0">
        <h3 className="text-sm font-medium mb-4">Employee Documents</h3>
        
        <DocumentUploadSection 
          documentType={documentType}
          setDocumentType={setDocumentType}
          selectedFiles={selectedFiles}
          uploadingFile={uploadingFile}
          handleFileChange={handleFileChange}
          handleUpload={handleUpload}
          fileInputRef={fileInputRef}
        />
        
        <DocumentsList 
          documents={documents || []}
          isLoading={isLoadingDocuments}
          onDelete={handleDelete}
          deleting={deleting}
        />
        
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Document
          </Button>
          
          <AssignDocumentDialog 
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            employeeId={employeeId}
            onSuccess={onAssignmentComplete}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
