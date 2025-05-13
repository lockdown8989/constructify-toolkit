import React, { useEffect, useState } from 'react';
import { useEmployeeDocuments } from '@/hooks/use-documents';
import { Card } from '@/components/ui/card';
import { FileText, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentListProps {
  employeeId?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ employeeId }) => {
  const { data: documents = [], isLoading, refetch, isError } = useEmployeeDocuments(employeeId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [documentCounts, setDocumentCounts] = useState({
    contract: 0,
    payslip: 0
  });

  // Calculate document counts whenever documents change
  useEffect(() => {
    if (documents?.length) {
      const counts = {
        contract: documents.filter(doc => doc.document_type === 'contract').length,
        payslip: documents.filter(doc => doc.document_type === 'payslip').length
      };
      setDocumentCounts(counts);
    }
  }, [documents]);

  // Set up real-time subscription
  useEffect(() => {
    if (!employeeId) return;

    // Subscribe to changes in the documents table for this employee
    const channel = supabase
      .channel('document-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `employee_id=eq.${employeeId}`
        },
        (payload) => {
          console.log('Document change detected:', payload);
          refetch();
          toast({
            title: "New document available",
            description: "A new document has been added to your account."
          });
        }
      )
      .subscribe();

    // Also listen for document assignment changes
    const assignmentChannel = supabase
      .channel('document-assignments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_assignments',
          filter: `employee_id=eq.${employeeId}`
        },
        (payload) => {
          console.log('New document assignment detected:', payload);
          refetch();
          toast({
            title: "Document assigned",
            description: "A new document has been assigned to you."
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(assignmentChannel);
    };
  }, [employeeId, refetch, toast, queryClient]);
  
  const handleRefresh = () => {
    refetch();
    setLastRefreshed(new Date());
    toast({
      title: "Refreshing documents",
      description: "Checking for new documents..."
    });
  };
  
  const handleDownload = async (url: string | undefined, path: string | undefined, fileName: string) => {
    if (isDownloading || (!url && !path)) return;
    
    try {
      setIsDownloading(path || url || fileName);

      // If we have a direct URL, use it
      if (url) {
        // Create an anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.target = '_blank';
        a.click();
        
        toast({
          title: "Download started",
          description: `${fileName} should begin downloading`
        });
        return;
      }
      
      // Otherwise download from storage
      if (path) {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(path);
          
        if (error) throw error;
        
        // Create blob URL and trigger download
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download successful",
          description: `${fileName} has been downloaded`
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-red-500">Error loading documents. Please try again.</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  const contractDocs = documents.filter(doc => doc.document_type === 'contract');
  const payslipDocs = documents.filter(doc => doc.document_type === 'payslip');
  
  const contractDoc = contractDocs.length > 0 ? contractDocs[0] : null;
  const payslipDoc = payslipDocs.length > 0 ? payslipDocs[0] : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Your Documents</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last checked: {lastRefreshed.toLocaleTimeString()}
          </span>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh documents</span>
          </Button>
        </div>
      </div>

      {documents.length === 0 && (
        <Alert className="bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have any documents yet. Your manager can upload documents for you.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium">Contract</h3>
              <p className="text-sm text-gray-500">
                {contractDoc ? (
                  <>
                    {contractDoc.name}
                    <span className="block text-xs text-muted-foreground">
                      {contractDoc.size || 'Unknown size'}
                    </span>
                  </>
                ) : (
                  'Not available'
                )}
              </p>
            </div>
          </div>
          {contractDoc && (
            <Button 
              variant="outline"
              onClick={() => handleDownload(contractDoc.url, contractDoc.path, contractDoc.name)}
              disabled={isDownloading === (contractDoc.path || contractDoc.url)}
            >
              {isDownloading === (contractDoc.path || contractDoc.url) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                'Download'
              )}
            </Button>
          )}
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium">Latest Payslip</h3>
              <p className="text-sm text-gray-500">
                {payslipDoc ? (
                  <>
                    {payslipDoc.name}
                    <span className="block text-xs text-muted-foreground">
                      {payslipDoc.size || 'Unknown size'}
                    </span>
                  </>
                ) : (
                  'Not available'
                )}
              </p>
            </div>
          </div>
          {payslipDoc && (
            <Button 
              variant="outline"
              onClick={() => handleDownload(payslipDoc.url, payslipDoc.path, payslipDoc.name)}
              disabled={isDownloading === (payslipDoc.path || payslipDoc.url)}
            >
              {isDownloading === (payslipDoc.path || payslipDoc.url) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                'Download'
              )}
            </Button>
          )}
        </div>
      </Card>
      
      {documentCounts.contract > 1 || documentCounts.payslip > 1 ? (
        <div className="text-center mt-2">
          <Button variant="link" className="text-sm">
            View all documents ({documents.length})
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default DocumentList;
