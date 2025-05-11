
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents';
import { useDocumentAssignments } from '@/hooks/use-document-assignments';
import { Plus, Loader2, Trash2, Upload, FileText, Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import DocumentUploadCard from '@/components/salary/components/DocumentUploadCard';
import DocumentAssignmentDialog from './DocumentAssignmentDialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface DocumentsSectionProps {
  employeeId: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employeeId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all-documents');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('resume');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Use the custom hooks
  const { data: documents = [], isLoading, refetch } = useEmployeeDocuments(employeeId);
  const { data: assignments = [], isLoading: isLoadingAssignments } = useDocumentAssignments(employeeId);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    } else {
      setSelectedFile(null);
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Submit clicked", { selectedFile, documentType, employeeId });
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Starting upload...");
      setIsUploading(true);
      
      await uploadDocument.mutateAsync({
        file: selectedFile,
        employeeId,
        documentType
      });
      
      // Clear the file input and selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the document list
      refetch();
      
    } catch (error) {
      console.error("Error during upload:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteDocument = async (documentId: string, path?: string) => {
    try {
      await deleteDocument.mutateAsync({ 
        id: documentId, 
        path, 
        employeeId 
      });
      // Refresh the document list
      refetch();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: 'contract' | 'payslip') => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument.mutateAsync({
        file,
        employeeId,
        documentType: docType
      }).then(() => {
        refetch();
      }).catch(error => {
        console.error(`Error uploading ${docType}:`, error);
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive"
        });
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Documents</span>
          <Button
            size="sm"
            onClick={() => setIsAssignDialogOpen(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Assign Document
          </Button>
        </CardTitle>
        <CardDescription>Upload and manage employee documents.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-documents">All Documents</TabsTrigger>
            <TabsTrigger value="quick-upload">Quick Upload</TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments
              {assignments.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {assignments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-documents">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="document-type">Document Type</Label>
                <Select 
                  value={documentType} 
                  onValueChange={setDocumentType}
                >
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select a document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume">Resume</SelectItem>
                    <SelectItem value="cover_letter">Cover Letter</SelectItem>
                    <SelectItem value="id_card">ID Card</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="payslip">Payslip</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="document-upload">Upload Document</Label>
                <Input
                  type="file"
                  id="document-upload"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="cursor-pointer"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isUploading || !selectedFile}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Document"
                )}
              </Button>
            </form>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500">Uploaded Documents</h4>
                <Table>
                  <TableCaption>A list of your documents.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map(document => (
                      <TableRow key={document.id}>
                        <TableCell>
                          {document.url ? (
                            <a href={document.url} target="_blank" rel="noopener noreferrer" className="underline">
                              {document.name}
                            </a>
                          ) : (
                            document.name
                          )}
                        </TableCell>
                        <TableCell>{document.document_type}</TableCell>
                        <TableCell>{document.size}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={deleteDocument.isPending}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the document
                                  from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteDocument(document.id, document.path)}
                                  disabled={deleteDocument.isPending}
                                >
                                  {deleteDocument.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No documents uploaded yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="quick-upload">
            <div className="space-y-4 py-4">
              <DocumentUploadCard
                type="contract"
                size="Max 10MB"
                onUpload={(e) => handleUpload(e, 'contract')}
                isUploading={uploadDocument.isPending}
                fileName={documents.find(d => d.document_type === 'contract')?.name}
              />
              
              <DocumentUploadCard
                type="payslip"
                size="Max 10MB"
                onUpload={(e) => handleUpload(e, 'payslip')}
                isUploading={uploadDocument.isPending}
                fileName={documents.find(d => d.document_type === 'payslip')?.name}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="assignments">
            {isLoadingAssignments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : assignments && assignments.length > 0 ? (
              <Table>
                <TableCaption>Assigned documents</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {assignment.document?.name || "Unknown Document"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.is_required ? (
                          <Badge variant="destructive">Required</Badge>
                        ) : (
                          <Badge variant="outline">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.due_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          "No due date"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.status === 'completed' ? 'success' :
                            assignment.status === 'overdue' ? 'destructive' :
                            assignment.status === 'viewed' ? 'secondary' :
                            'outline'
                          }
                        >
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-4 text-sm text-muted-foreground text-center">
                No document assignments found.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Document Assignment Dialog */}
      <DocumentAssignmentDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        employeeId={employeeId}
      />
    </Card>
  );
};

export default DocumentsSection;
