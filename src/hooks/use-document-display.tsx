
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

type DocumentType = 'pdf' | 'word' | 'excel' | 'image' | 'other';

interface UseDocumentDisplayOptions {
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

export function useDocumentDisplay(options?: UseDocumentDisplayOptions) {
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  /**
   * Gets the appropriate icon for a document based on its file type
   */
  const getDocumentIcon = (fileName: string | undefined): string => {
    if (!fileName) return '/placeholder.svg';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '/pdf-icon.png';
      case 'doc':
      case 'docx':
        return '/word-icon.png';
      case 'xls':
      case 'xlsx':
        return '/excel-icon.png';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return fileName; // Use the actual image as its own icon
      default:
        return '/placeholder.svg';
    }
  };
  
  /**
   * Gets the document type from a file name
   */
  const getDocumentType = (fileName: string | undefined): DocumentType => {
    if (!fileName) return 'other';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'other';
    }
  };

  /**
   * Downloads a document from a URL or storage path
   */
  const downloadDocument = async (
    documentPath: string | undefined, 
    documentName: string | undefined,
    documentId: string
  ) => {
    if (!documentPath) {
      toast({
        title: "Download Failed",
        description: "Document path is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDownloading(prev => ({ ...prev, [documentId]: true }));
      options?.onDownloadStart?.();
      
      let url: string;
      
      // Check if it's already a URL or a storage path
      if (documentPath.startsWith('http')) {
        url = documentPath;
      } else {
        // Get signed URL from Supabase Storage
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(documentPath, 60); // 60 seconds expiry
          
        if (error) {
          throw new Error(`Failed to generate signed URL: ${error.message}`);
        }
        
        if (!data?.signedUrl) {
          throw new Error('No signed URL generated');
        }
        
        url = data.signedUrl;
      }
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `${documentName || 'Document'} is being downloaded`
      });
      
      options?.onDownloadComplete?.();
    } catch (error) {
      console.error("Document download error:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      
      options?.onDownloadError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsDownloading(prev => ({ ...prev, [documentId]: false }));
    }
  };
  
  return {
    getDocumentIcon,
    getDocumentType,
    downloadDocument,
    isDownloading
  };
}
