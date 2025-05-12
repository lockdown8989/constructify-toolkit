
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents';
import { Plus, Loader2, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DocumentsSectionProps {
  employeeId: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employeeId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('resume');
  const { toast } = useToast();
  
  // Use the custom hooks
  const { data: documents, isLoading } = useEmployeeDocuments(employeeId);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    console.log("File selected:", file?.name);
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
      
      setSelectedFile(null);
      // Clear file input
      const input = document.getElementById('document-upload') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
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
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Upload and manage employee documents.</CardDescription>
      </CardHeader>
      <CardContent>
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
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="document-upload">Upload Document</Label>
            <Input
              type="file"
              id="document-upload"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          <Button type="submit" disabled={isUploading || !selectedFile}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
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
                      <a href={document.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {document.name}
                      </a>
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
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;
