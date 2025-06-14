
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText } from 'lucide-react';
import { getFileIcon, isImageFile, isDocumentFile } from '@/utils/file-validation';
import type { DocumentModel } from '@/hooks/use-documents';

interface DocumentPreviewProps {
  document: DocumentModel;
  onDownload: (document: DocumentModel) => void;
  onView?: (document: DocumentModel) => void;
  className?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onDownload,
  onView,
  className
}) => {
  const canPreview = isImageFile(document.title) || document.title.toLowerCase().endsWith('.pdf');

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {isImageFile(document.title) && document.url ? (
              <img 
                src={document.url} 
                alt={document.title}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-lg">
                {getFileIcon(document.title)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {document.title}
            </h4>
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <span>{document.category}</span>
              {document.size && (
                <>
                  <span>•</span>
                  <span>{document.size}</span>
                </>
              )}
              {document.created_at && (
                <>
                  <span>•</span>
                  <span>{new Date(document.created_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {canPreview && onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(document)}
              className="h-8 w-8 p-0"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(document)}
            className="h-8 w-8 p-0"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
