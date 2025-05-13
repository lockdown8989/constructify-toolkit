
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Trash2, Loader2, File, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DocumentModel } from '@/hooks/use-documents';

interface DocumentsListProps {
  documents: DocumentModel[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  deleting: string | null;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ 
  documents, 
  isLoading, 
  onDelete, 
  deleting 
}) => {
  const getDocumentIcon = (docType: string | undefined) => {
    if (!docType) return <File className="h-5 w-5 text-gray-500" />;
    
    const lowercaseType = docType.toLowerCase();
    
    if (lowercaseType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (lowercaseType.includes('word') || lowercaseType.includes('doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (lowercaseType.includes('excel') || lowercaseType.includes('xls')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-6">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No documents uploaded</p>
        <p className="text-sm text-muted-foreground">
          Upload documents to share with this employee
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getDocumentIcon(doc.document_type)}
                  <span>{doc.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : 'Unknown date'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {doc.size || "-"}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => window.open(doc.url, '_blank')}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(doc.id)}
                  disabled={!!deleting}
                  title="Delete"
                >
                  {deleting === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsList;
