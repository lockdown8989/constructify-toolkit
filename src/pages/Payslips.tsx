
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import { useEmployeeDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents';
import { useAttachPayslipToEmployee } from '@/hooks/use-payroll-documents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Trash2, Download, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PayslipUploadDialog from '@/components/salary/components/PayslipUploadDialog';

const Payslips = () => {
  const { user, isPayroll } = useAuth();
  const { data: employees = [] } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('payslip');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isPayslipDialogOpen, setIsPayslipDialogOpen] = useState(false);
  
  const { data: documents = [], isLoading } = useEmployeeDocuments(selectedEmployeeId);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const { toast } = useToast();

  // If user is not payroll, show access denied
  if (!isPayroll) {
    return (
      <div className="container py-6 max-w-4xl mx-auto">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  const handleFileUpload = async () => {
    if (!uploadFile || !selectedEmployeeId) {
      toast({
        title: "Missing information",
        description: "Please select an employee and file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        file: uploadFile,
        employeeId: selectedEmployeeId,
        documentType
      });
      
      setUploadFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDownload = async (path: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(path);
        
      if (error) throw error;
      
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = title;
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

  const handleDelete = async (docId: string, path?: string) => {
    if (!selectedEmployeeId) return;
    
    try {
      await deleteDocument.mutateAsync({
        id: docId,
        path,
        employeeId: selectedEmployeeId
      });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="container py-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payslip Management</h1>
        <p className="text-gray-600 mt-2">Upload and manage employee payslips and documents</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upload Document</h2>
            {selectedEmployeeId && (
              <Button
                onClick={() => setIsPayslipDialogOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Quick Payslip Upload
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Employee</label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Document Type</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payslip">Payslip</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="p60">P60</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="general">General Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">File</label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button 
              onClick={handleFileUpload}
              disabled={!uploadFile || !selectedEmployeeId || uploadDocument.isPending}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadDocument.isPending ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </Card>

        {/* Employee Documents List */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Documents</h2>
          
          {!selectedEmployeeId ? (
            <p className="text-gray-500 text-center py-8">
              Select an employee to view their documents
            </p>
          ) : isLoading ? (
            <p className="text-gray-500 text-center py-8">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents found</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className={`h-5 w-5 ${
                      doc.category === 'payslip' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-gray-500">
                        {doc.category || doc.document_type} • {doc.size}
                        {doc.created_at && ` • ${new Date(doc.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {doc.path && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc.path!, doc.title)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.path)}
                      disabled={deleteDocument.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Payslip Upload Dialog */}
      {selectedEmployee && (
        <PayslipUploadDialog
          isOpen={isPayslipDialogOpen}
          onClose={() => setIsPayslipDialogOpen(false)}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
        />
      )}
    </div>
  );
};

export default Payslips;
