
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EmployeeDocument } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: EmployeeDocument[];
  isLoading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, isLoading }) => {
  const { toast } = useToast();

  const handleDocumentClick = async (doc: EmployeeDocument) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast({
        title: "Document not available",
        description: "This document has not been uploaded yet.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {isLoading ? (
        <div className="col-span-2 py-4 text-center">
          <div className="animate-pulse">Loading documents...</div>
        </div>
      ) : (
        documents.map((doc, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-center p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors",
            )}
            onClick={() => handleDocumentClick(doc)}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mr-3",
              doc.type === 'contract' ? "bg-blue-100 text-blue-700" : 
              doc.type === 'resume' ? "bg-red-100 text-red-700" :
              "bg-green-100 text-green-700"
            )}>
              {doc.type === 'contract' ? 'C' : doc.type === 'resume' ? 'R' : 'P'}
            </div>
            <div>
              <div className="text-sm font-medium">{doc.name.split('_')[0]}</div>
              <div className="text-xs text-gray-500 flex items-center">
                {doc.size}
                {doc.url && (
                  <Download className="h-3 w-3 ml-1 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentList;
