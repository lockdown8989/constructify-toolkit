
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useEmployeeDocuments } from '@/hooks/use-documents';
import { useAssignDocument } from '@/hooks/use-document-assignments';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
}

const DocumentAssignmentDialog: React.FC<DocumentAssignmentDialogProps> = ({
  isOpen,
  onClose,
  employeeId,
}) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [isRequired, setIsRequired] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const { data: documents = [], isLoading: isLoadingDocuments } = useEmployeeDocuments(undefined);
  const assignDocument = useAssignDocument();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocumentId) {
      toast({
        title: "No document selected",
        description: "Please select a document to assign",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await assignDocument.mutateAsync({
        documentId: selectedDocumentId,
        employeeId,
        isRequired,
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined
      });
      
      onClose();
    } catch (error) {
      console.error('Error assigning document:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Document to Employee</DialogTitle>
          <DialogDescription>
            Select a document to assign to this employee.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document">Document</Label>
            <Select
              value={selectedDocumentId}
              onValueChange={setSelectedDocumentId}
            >
              <SelectTrigger id="document">
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDocuments ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} ({doc.document_type})
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    No documents available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked === true)}
            />
            <Label htmlFor="required">Mark as required</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date (Optional)</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="due-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedDocumentId || assignDocument.isPending}
            >
              {assignDocument.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAssignmentDialog;
