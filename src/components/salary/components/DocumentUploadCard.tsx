
import React from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadCardProps {
  type: 'contract' | 'payslip';
  size: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  type,
  size,
  onUpload,
  isUploading = false,
  disabled = false
}) => {
  const backgroundColors = {
    contract: 'bg-blue-50',
    payslip: 'bg-green-50'
  };

  const borderColors = {
    contract: 'border-blue-200',
    payslip: 'border-green-200'
  };

  const iconColors = {
    contract: 'text-blue-600',
    payslip: 'text-green-600'
  };

  return (
    <div 
      className={cn(
        "relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
        backgroundColors[type],
        borderColors[type],
        "hover:shadow-md",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center space-x-4">
        <div className={cn(
          "p-2 rounded-lg",
          backgroundColors[type]
        )}>
          <FileText className={cn("w-8 h-8", iconColors[type])} />
        </div>
        <div>
          <h3 className="text-base font-medium capitalize">{type}</h3>
          <p className="text-sm text-gray-500">{size || '0 KB'}</p>
        </div>
      </div>
      
      <label 
        className={cn(
          "cursor-pointer rounded-full p-2 hover:bg-white/50 transition-colors",
          isUploading && "pointer-events-none"
        )}
      >
        {isUploading ? (
          <div className="animate-spin">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
        ) : (
          <Upload className={cn("w-6 h-6", iconColors[type])} />
        )}
        <input
          type="file"
          className="hidden"
          onChange={onUpload}
          accept=".pdf,.doc,.docx"
          disabled={disabled || isUploading}
        />
      </label>
    </div>
  );
};

export default DocumentUploadCard;

