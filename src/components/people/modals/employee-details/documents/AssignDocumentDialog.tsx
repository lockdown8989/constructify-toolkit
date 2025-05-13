
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useEmployeeDocuments } from '@/hooks/use-documents';
import { useAssignDocument } from '@/hooks/use-document-assignments';
import { format } from 'date-fns';

interface AssignDocumentDialogProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AssignDocumentDialog: React.FC<AssignDocumentDialogProps> = ({
  employeeId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isRequired, setIsRequired] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  
  const { data: documents, isLoading } = useEmployeeDocuments(employeeId);
  const { mutateAsync: assignDocument, isPending } = useAssignDocument();
  
  const handleSubmit = async () => {
    if (!selectedDocument) return;
    
    try {
      await assignDocument({
        documentId: selectedDocument,
        employeeId,
        isRequired,
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined
      });
      
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setSelectedDocument(null);
      setIsRequired(false);
      setDueDate(undefined);
    } catch (error) {
      console.error('Error assigning document:', error);
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
            <Select onValueChange={setSelectedDocument} value={selectedDocument || undefined}>
              <SelectTrigger id="document">
                <SelectValue placeholder="Select document" />
              </SelectTrigger>
              <SelectContent>
                {documents?.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
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
            <label 
              htmlFor="required" 
              className="text-sm font-medium leading-none cursor-pointer"
            >
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
          <Button onClick={handleSubmit} disabled={!selectedDocument || isPending}>
            {isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDocumentDialog;
