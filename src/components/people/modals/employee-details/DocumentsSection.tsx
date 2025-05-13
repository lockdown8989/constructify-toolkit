import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents';
import { useDocumentAssignments, useAssignDocument, useUpdateDocumentAssignment } from '@/hooks/use-document-assignments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, FileText, Download, Trash2, Loader2, File, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentsSectionProps {
  employeeId: string;
}

interface Document {
  id: string;
  name: string;
  document_type: string;
  size: string;
  created_at: string;
  url?: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employeeId }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRequired, setIsRequired] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [documentType, setDocumentType] = useState('general');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    data: documents, 
    isLoading: isLoadingDocuments, 
    refetch: refetchDocuments 
  } = useEmployeeDocuments(employeeId);
  
  const {
    data: assignments,
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments
  } = useDocumentAssignments(employeeId);
  
  const { mutateAsync: uploadDocument } = useUploadDocument();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { mutateAsync: assignDocument } = useAssignDocument();
  const { mutateAsync: updateAssignmentStatus } = useUpdateDocumentAssignment();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingFile(true);
    
    try {
      console.log(`Starting upload for ${selectedFiles.length} files, document type: ${documentType}`);
      
      for (const file of selectedFiles) {
        console.log(`Uploading file: ${file.name}`);
        const result = await uploadDocument({
          employeeId,
          file,
          documentType: documentType
        });
        
        if (!result) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
      
      toast({
        title: "Upload successful",
        description: `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} uploaded successfully.`,
      });
      
      setSelectedFiles([]);
      refetchDocuments();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file(s). Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    setDeleting(id);
    
    try {
      await deleteDocument({
        id,
        employeeId
      });
      
      toast({
        title: "Document deleted",
        description: "The document was successfully deleted.",
      });
      
      refetchDocuments();
      refetchAssignments();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };
  
  const handleAssignDocument = async () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to assign.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await assignDocument({
        employeeId,
        documentId: selectedDocument,
        isRequired,
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined
      });
      
      toast({
        title: "Document assigned",
        description: "The document was successfully assigned to the employee.",
      });
      
      setAssignDialogOpen(false);
      setSelectedDocument(null);
      setIsRequired(false);
      setDueDate(undefined);
      refetchAssignments();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment failed",
        description: "There was an error assigning the document.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateStatus = async (assignmentId: string, status: 'pending' | 'viewed' | 'completed' | 'overdue') => {
    try {
      await updateAssignmentStatus({
        id: assignmentId,
        status
      });
      
      toast({
        title: "Status updated",
        description: `Assignment status updated to ${status}.`,
      });
      
      refetchAssignments();
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: "Status update failed",
        description: "There was an error updating the assignment status.",
        variant: "destructive"
      });
    }
  };
  
  const getDocumentIcon = (docType: string) => {
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
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-4">
          <Card className="border-none">
            <CardContent className="p-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Employee Documents</h3>
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                  >
                    Select Files
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploadingFile}
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Document type selection */}
              <div className="mb-4">
                <Label htmlFor="documentType" className="mb-2 block">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="resume">Resume</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="payslip">Payslip</SelectItem>
                    <SelectItem value="id">ID Document</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mb-4 p-3 bg-muted rounded-md">
                  <p className="text-xs font-medium mb-2">Selected Files ({selectedFiles.length})</p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isLoadingDocuments ? (
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
              ) : documents && documents.length > 0 ? (
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
                              onClick={() => handleDelete(doc.id)}
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
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No documents uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    Upload documents to share with this employee
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="document">Document</Label>
                        <Select onValueChange={setSelectedDocument}>
                          <SelectTrigger id="document">
                            <SelectValue placeholder="Select document" />
                          </SelectTrigger>
                          <SelectContent>
                            {documents?.map((doc) => (
                              <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="required" checked={isRequired} onCheckedChange={(checked) => setIsRequired(!!checked)} />
                        <label htmlFor="required" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Required document
                        </label>
                      </div>
                      
                      {isRequired && (
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <DatePicker date={dueDate} setDate={setDueDate} />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAssignDocument}>Assign</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-4">
          <Card className="border-none">
            <CardContent className="p-0">
              <h3 className="text-sm font-medium mb-4">Document Assignments</h3>
              
              {isLoadingAssignments ? (
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
              ) : assignments && assignments.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {assignment.document && 
                                getDocumentIcon(assignment.document.document_type || '')}
                              <span>{assignment.document ? assignment.document.name : 'Unknown document'}</span>
                              {assignment.is_required && (
                                <Badge variant="outline" className="ml-2">Required</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {assignment.due_date ? format(new Date(assignment.due_date), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                assignment.status === 'completed' ? 'default' :
                                assignment.status === 'overdue' ? 'destructive' :
                                assignment.status === 'viewed' ? 'secondary' :
                                'outline'
                              }
                            >
                              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Select 
                                value={assignment.status}
                                onValueChange={(value) => handleUpdateStatus(assignment.id, value as any)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Change status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="viewed">Viewed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No document assignments</p>
                  <p className="text-sm text-muted-foreground">
                    Assign documents to this employee from the Documents tab
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function for formatting file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default DocumentsSection;
