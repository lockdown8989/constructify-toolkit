
import React, { useEffect } from 'react';
import { useEmployeeDocuments } from '@/hooks/use-documents';
import { Card } from '@/components/ui/card';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentListProps {
  employeeId?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ employeeId }) => {
  const { data: documents = [], isLoading, refetch } = useEmployeeDocuments(employeeId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Refresh documents when the component mounts or when employeeId changes
  useEffect(() => {
    if (employeeId) {
      refetch();
    }
  }, [employeeId, refetch]);
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing documents",
      description: "Checking for new documents..."
    });
  };
  
  const handleDownload = async (path: string, fileName: string) => {
    try {
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
        title: "Download started",
        description: `Downloading ${fileName}...`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not download the document",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-gray-500">Loading documents...</p>
      </div>
    );
  }

  const contractDoc = documents.find(doc => doc.document_type === 'contract');
  const payslipDoc = documents.find(doc => doc.document_type === 'payslip');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Your Documents</h3>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 p-0">
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh documents</span>
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium">Contract</h3>
              <p className="text-sm text-gray-500">
                {contractDoc ? contractDoc.size : 'Not available'}
              </p>
            </div>
          </div>
          {contractDoc && (
            <Button 
              variant="outline"
              onClick={() => handleDownload(contractDoc.path!, contractDoc.name)}
            >
              Download
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
                {payslipDoc ? payslipDoc.size : 'Not available'}
              </p>
            </div>
          </div>
          {payslipDoc && (
            <Button 
              variant="outline"
              onClick={() => handleDownload(payslipDoc.path!, payslipDoc.name)}
            >
              Download
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DocumentList;
