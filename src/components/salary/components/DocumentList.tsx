
import React from 'react';
import { useEmployeeDocuments } from '@/hooks/use-documents';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface DocumentListProps {
  employeeId?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ employeeId }) => {
  const { user } = useAuth();
  // Pass undefined to let the hook determine the correct employee ID for current user
  const { data: documents = [], isLoading } = useEmployeeDocuments(employeeId);
  const { toast } = useToast();
  
  const handleDownload = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(path);
        
      if (error) throw error;
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
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
    return <div>Loading documents...</div>;
  }

  // Use category field (with fallback to document_type for backward compatibility)
  const contractDoc = documents.find(doc => 
    (doc.category || doc.document_type) === 'contract'
  );
  
  // Get the most recent payslip
  const payslipDocs = documents.filter(doc => 
    (doc.category || doc.document_type) === 'payslip'
  ).sort((a, b) => 
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
  
  const latestPayslip = payslipDocs[0];

  return (
    <div className="space-y-4">
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
          {contractDoc && contractDoc.path && (
            <Button 
              variant="outline"
              onClick={() => handleDownload(contractDoc.path!, contractDoc.title)}
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
                {latestPayslip ? (
                  <>
                    {latestPayslip.size}
                    {latestPayslip.created_at && (
                      <> • {new Date(latestPayslip.created_at).toLocaleDateString()}</>
                    )}
                  </>
                ) : (
                  'Not available'
                )}
              </p>
            </div>
          </div>
          {latestPayslip && latestPayslip.path && (
            <Button 
              variant="outline"
              onClick={() => handleDownload(latestPayslip.path!, latestPayslip.title)}
            >
              Download
            </Button>
          )}
        </div>
      </Card>
      
      {payslipDocs.length > 1 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Previous Payslips ({payslipDocs.length - 1})</h4>
          <div className="space-y-2">
            {payslipDocs.slice(1, 4).map((payslip) => (
              <div key={payslip.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{payslip.title}</span>
                  <span className="text-xs text-gray-500">
                    {payslip.created_at && new Date(payslip.created_at).toLocaleDateString()}
                  </span>
                </div>
                {payslip.path && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownload(payslip.path!, payslip.title)}
                  >
                    Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentList;
