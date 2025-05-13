
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { formatFileSize } from '../utils';

interface DocumentUploadSectionProps {
  documentType: string;
  setDocumentType: (value: string) => void;
  selectedFiles: File[];
  uploadingFile: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  documentType,
  setDocumentType,
  selectedFiles,
  uploadingFile,
  handleFileChange,
  handleUpload,
  fileInputRef
}) => {
  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
          >
            Select Files
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadingFile}
          >
            {uploadingFile ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="documentType" className="mb-2 block">Document Type</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger id="documentType">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="resume">Resume</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="payslip">Payslip</SelectItem>
            <SelectItem value="id">ID Document</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-xs font-medium mb-2">Selected Files ({selectedFiles.length})</p>
          <div className="space-y-1">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadSection;
