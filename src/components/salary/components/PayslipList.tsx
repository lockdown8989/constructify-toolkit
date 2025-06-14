
import React from 'react';
import { useEmployeeDocuments } from '@/hooks/use-documents';
import { Card } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayslipListProps {
  employeeId: string;
}

const PayslipList: React.FC<PayslipListProps> = ({ employeeId }) => {
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
        description: "Could not download the payslip",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xs font-semibold text-gray-500 mb-5 uppercase tracking-wider">
          Latest Payslips
        </h3>
        <div>Loading payslips...</div>
      </Card>
    );
  }

  // Filter for payslip documents
  const payslips = documents.filter(doc => 
    (doc.category === 'payslip' || doc.document_type === 'payslip')
  ).sort((a, b) => 
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold text-gray-500 mb-5 uppercase tracking-wider">
        Latest Payslips
      </h3>
      
      {payslips.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No payslips available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payslips.slice(0, 3).map((payslip) => (
            <div key={payslip.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{payslip.title}</p>
                  <p className="text-sm text-gray-500">
                    {payslip.created_at && new Date(payslip.created_at).toLocaleDateString()}
                    {payslip.size && ` • ${payslip.size}`}
                  </p>
                </div>
              </div>
              
              {payslip.path && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(payslip.path!, payslip.title)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PayslipList;
