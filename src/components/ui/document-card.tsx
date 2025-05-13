
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentDisplay } from '@/hooks/use-document-display';

export interface DocumentCardProps {
  id: string;
  name: string;
  path?: string;
  type?: string;
  size?: string;
  createdAt?: string;
  onView?: () => void;
  className?: string;
}

export function DocumentCard({
  id,
  name,
  path,
  type = 'document',
  size,
  createdAt,
  onView,
  className
}: DocumentCardProps) {
  const { getDocumentIcon, downloadDocument, isDownloading } = useDocumentDisplay();
  
  const handleDownload = () => {
    downloadDocument(path, name, id);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  const formatFileSize = (sizeString?: string) => {
    if (!sizeString) return '';
    return sizeString;
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className="mr-4 w-10 h-10 flex items-center justify-center overflow-hidden">
            <img 
              src={getDocumentIcon(name)} 
              alt={type}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-xs text-muted-foreground flex gap-2">
              {size && <span>{formatFileSize(size)}</span>}
              {createdAt && (
                <>
                  {size && <span>•</span>}
                  <span>{formatDate(createdAt)}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            {onView && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onView}
                aria-label="View document"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownload}
              disabled={isDownloading[id] || !path}
              aria-label="Download document"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
