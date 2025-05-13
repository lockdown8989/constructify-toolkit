
import { DocumentCard } from '@/components/ui/document-card';
import { DocumentModel } from '@/types/database';

export interface DocumentListProps {
  documents: DocumentModel[];
  onViewDocument?: (document: DocumentModel) => void;
  emptyMessage?: string;
  className?: string;
}

export function DocumentList({
  documents,
  onViewDocument,
  emptyMessage = "No documents available",
  className = ""
}: DocumentListProps) {
  if (!documents.length) {
    return (
      <div className={`text-center p-4 text-muted-foreground ${className}`}>
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          id={doc.id}
          name={doc.name}
          path={doc.path}
          type={doc.document_type}
          size={doc.size}
          createdAt={doc.created_at}
          onView={onViewDocument ? () => onViewDocument(doc) : undefined}
        />
      ))}
    </div>
  );
}
