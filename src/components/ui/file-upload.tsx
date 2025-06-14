
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { validateFile, getFileIcon } from '@/utils/file-validation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  accept?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.csv,.xls,.xlsx",
  disabled = false,
  className,
  placeholder = "Choose a file to upload"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {selectedFile ? 'Change File' : 'Select File'}
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {selectedFile ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
          <span className="text-lg">{getFileIcon(selectedFile.name)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <FileText className="h-4 w-4 text-gray-400" />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-md text-center text-gray-500">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{placeholder}</span>
        </div>
      )}
    </div>
  );
};
