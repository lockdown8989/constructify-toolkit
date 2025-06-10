
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUploadDocument, type DocumentModel } from '@/hooks/use-documents';
import { useToast } from '@/hooks/use-toast';

interface DocumentAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

const DocumentAssignmentDialog: React.FC<DocumentAssignmentDialogProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const uploadDocument = useUploadDocument();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select a file and document type",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        file: selectedFile,
        employeeId,
        documentType
      });

      toast({
        title: "Document Uploaded",
        description: "Document has been successfully uploaded",
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Document to {employeeName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Document Type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="payslip">Payslip</SelectItem>
                <SelectItem value="p60">P60</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="general">General Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select File</label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !documentType || uploadDocument.isPending}
          >
            {uploadDocument.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAssignmentDialog;
