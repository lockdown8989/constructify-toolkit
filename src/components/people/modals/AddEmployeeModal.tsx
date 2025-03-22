
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEmployeeForm } from './useEmployeeForm';
import EmployeeFormFields from './EmployeeFormFields';

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: string[];
  sites: string[];
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  open,
  onOpenChange,
  departments = [],
  sites = [],
}) => {
  const { form, onSubmit, isSubmitting, error } = useEmployeeForm({
    onSuccess: () => onOpenChange(false),
  });

  const handleBackButtonClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackButtonClick} 
              className="mr-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details of the new employee. Click save when you're done.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
            
            <EmployeeFormFields 
              form={form} 
              departments={departments} 
              sites={sites} 
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackButtonClick}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
