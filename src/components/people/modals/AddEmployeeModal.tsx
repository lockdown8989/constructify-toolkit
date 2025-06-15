
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Briefcase } from 'lucide-react';
import { useEmployeeForm } from './useEmployeeForm';
import EmployeeFormFields from './EmployeeFormFields';
import { Employee } from '@/hooks/use-employees';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: string[];
  sites: string[];
  employeeToEdit?: Employee;
  defaultLocation?: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  open,
  onOpenChange,
  departments = [],
  sites = [],
  employeeToEdit,
  defaultLocation,
}) => {
  // Update the title and button text based on whether we're editing or adding
  const isEditMode = !!employeeToEdit;
  const title = isEditMode ? "Edit Employee" : "Add Team Member";
  const buttonText = isEditMode ? "Save Changes" : "Add Team Member";
  const loadingText = isEditMode ? "Saving..." : "Adding...";
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState<string>("personal");
  
  const { form, onSubmit, isSubmitting, error } = useEmployeeForm({
    onSuccess: () => onOpenChange(false),
    employeeToEdit,
    defaultLocation,
  });

  const handleBackButtonClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "w-full p-0 max-w-full h-[100dvh] max-h-[100dvh] rounded-none flex flex-col overflow-hidden" : "sm:max-w-[600px] p-6"}>
        <DialogHeader className={isMobile ? "p-4 shrink-0 border-b" : ""}>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackButtonClick} 
              className="mr-2 text-gray-500 hover:text-gray-800 touch-target"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {isEditMode 
                  ? "Edit the details of this team member."
                  : defaultLocation 
                    ? `Enter the details of the new team member for ${defaultLocation}.`
                    : "Enter the details of the new team member."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col flex-grow overflow-hidden">
            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md mx-4 mt-4">{error}</div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow overflow-hidden">
              <TabsList className={`grid grid-cols-3 ${isMobile ? "p-2 mx-4 mt-4 sticky top-0 z-10" : "mb-4"}`}>
                <TabsTrigger value="personal" className="text-sm min-h-[44px]">
                  <User className="mr-1 h-3.5 w-3.5" />
                  <span className={isMobile ? "hidden" : "inline"}>Personal Info</span>
                </TabsTrigger>
                <TabsTrigger value="organization" className="text-sm min-h-[44px]">
                  <Briefcase className="mr-1 h-3.5 w-3.5" />
                  <span className={isMobile ? "hidden" : "inline"}>Organization</span>
                </TabsTrigger>
                <TabsTrigger value="employment" className="text-sm min-h-[44px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-3.5 w-3.5">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" />
                  </svg>
                  <span className={isMobile ? "hidden" : "inline"}>Status</span>
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-grow overflow-y-auto px-4 pb-safe-area-inset-bottom momentum-scroll">
                <EmployeeFormFields 
                  form={form} 
                  departments={departments} 
                  sites={sites}
                  activeTab={activeTab}
                  isMobile={isMobile}
                />
              </ScrollArea>
            </Tabs>
            
            <DialogFooter className={`pt-4 ${isMobile ? "flex flex-col gap-2 px-4 pb-4 mt-auto border-t bg-white" : ""} safe-area-inset`}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackButtonClick}
                className={`${isMobile ? "w-full min-h-[44px]" : "mr-2"} active-touch-state`}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={`${isMobile ? "w-full min-h-[44px]" : ""} bg-blue-600 hover:bg-blue-700 active-touch-state`}
              >
                {isSubmitting ? loadingText : buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
