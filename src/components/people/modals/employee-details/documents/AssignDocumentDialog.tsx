
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { useAssignDocument } from '@/hooks/use-document-assignments';
import { DocumentModel } from '@/hooks/use-documents';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AssignDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentModel[];
  employeeId: string;
  onSuccess: () => void;
}

const AssignDocumentDialog: React.FC<AssignDocumentDialogProps> = ({
  open,
  onOpenChange,
  documents,
  employeeId,
  onSuccess
}) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isRequired, setIsRequired] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  
  const { toast } = useToast();
  const { mutateAsync: assignDocument } = useAssignDocument();
  
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
      
      onOpenChange(false);
      setSelectedDocument(null);
      setIsRequired(false);
      setDueDate(undefined);
      onSuccess();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment failed",
        description: "There was an error assigning the document.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="required" 
              checked={isRequired} 
              onCheckedChange={(checked) => setIsRequired(!!checked)} 
            />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignDocument}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDocumentDialog;
