
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, Briefcase, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployeeForm } from './useEmployeeForm';
import EmployeeFormFields from './EmployeeFormFields';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  defaultLocation
}) => {
  const [activeTab, setActiveTab] = useState('personal');
  const isMobile = useIsMobile();
  
  const { form, onSubmit, isSubmitting, error } = useEmployeeForm({
    onSuccess: onClose,
    defaultLocation
  });

  const departments = ['HR', 'Engineering', 'Marketing', 'Sales', 'Operations'];
  const sites = ['Main Office', 'Remote', 'Branch Office'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Add New Employee</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Add a new team member to your organization.
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} mb-6`}>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {!isMobile && 'Personal'}
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {!isMobile && 'Organization'}
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {!isMobile && 'Employment'}
              </TabsTrigger>
            </TabsList>

            <EmployeeFormFields
              form={form}
              departments={departments}
              sites={sites}
              activeTab={activeTab}
              isMobile={isMobile}
            />
          </Tabs>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="sticky bottom-0 bg-white pt-4 border-t flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding Employee...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
