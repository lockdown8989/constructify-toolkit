
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployees, useEmployeeFilters, Employee } from '@/hooks/use-employees';
import { useEmployeeForm } from './useEmployeeForm';
import EmployeeFormFields from './EmployeeFormFields';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  employeeToEdit?: Employee;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultLocation,
  employeeToEdit 
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('personal');
  
  const { data: filterOptions } = useEmployeeFilters();
  const departments = filterOptions?.departments || [];
  const sites = filterOptions?.sites || [];

  const { form, onSubmit, isSubmitting, error } = useEmployeeForm({
    onSuccess: () => {
      console.log('Employee form submitted successfully');
      onClose();
    },
    defaultLocation,
    employeeToEdit
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const modalTitle = employeeToEdit ? 'Edit Employee' : 'Add New Employee';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[95vw] max-w-[95vw] h-[95vh]' : 'sm:max-w-[600px] max-h-[85vh]'} 
          p-0 overflow-hidden flex flex-col
        `}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{modalTitle}</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b flex-shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="organization">Organization</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6">
              <EmployeeFormFields 
                form={form}
                departments={departments}
                sites={sites}
                activeTab={activeTab}
                isMobile={isMobile}
              />
            </div>

            {error && (
              <div className="px-6 py-2 border-t bg-red-50">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="px-6 py-4 border-t flex-shrink-0 bg-gray-50">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Saving...' : (employeeToEdit ? 'Update Employee' : 'Add Employee')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
