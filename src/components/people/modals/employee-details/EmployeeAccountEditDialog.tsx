import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { X, Shield, Mail, Key, User, Clock, Settings, Building, DollarSign, Calendar, Calculator } from 'lucide-react';
import { Employee } from '@/components/people/types';
import { useToast } from '@/hooks/use-toast';
import { useUpdateEmployee } from '@/hooks/use-employees';
import { useEmployeeSync } from '@/hooks/use-employee-sync';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/utils/format';
import ErrorBoundary, { FormErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingState } from '@/components/common/LoadingStates';
import { 
  PersonalInfoSection, 
  LoginInfoSection, 
  EmploymentDetailsSection, 
  SalarySection 
} from './sections/EmployeeFormSections';
import { 
  MobileHeader, 
  LoadingOverlay, 
  FormActions, 
  ErrorMessage 
} from './sections/MobileDialogComponents';

interface EmployeeAccountEditDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeAccountEditDialog: React.FC<EmployeeAccountEditDialogProps> = ({
  employee,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const updateEmployee = useUpdateEmployee();
  const { syncEmployee, isSyncing } = useEmployeeSync();
  const isMobile = useIsMobile();
  
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Personal Information
    name: employee?.name || '',
    email: employee?.email || '',
    location: employee?.site || 'Office',
    
    // Login Information - Use the employee's actual email
    loginEmail: employee?.email || '',
    password: '123Qwe@×', // As specified by user
    
    // Profile Information
    firstName: employee?.name?.split(' ')[0] || '',
    lastName: employee?.name?.split(' ')[1] || '',
    position: employee?.jobTitle || '',
    department: employee?.department || '',
    managerId: employee?.managerId || '',
    
    // Employment Details
    job_title: employee?.jobTitle || '',
    salary: Number(employee?.salary || 0),
    start_date: employee?.startDate || new Date().toISOString().split('T')[0],
    status: employee?.status || 'Active',
    lifecycle: employee?.lifecycle || 'Active',
    
    // Account Settings
    role: employee?.role || 'employee',
    annual_leave_days: employee?.annual_leave_days || 25,
    sick_leave_days: employee?.sick_leave_days || 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when employee prop changes
  React.useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        location: employee.site || 'Office',
        loginEmail: employee.email || '',
        password: '123Qwe@×',
        firstName: employee.name?.split(' ')[0] || '',
        lastName: employee.name?.split(' ')[1] || '',
        position: employee.jobTitle || '',
        department: employee.department || '',
        managerId: employee.managerId || '',
        job_title: employee.jobTitle || '',
        salary: Number(employee.salary || 0),
        start_date: employee.startDate || new Date().toISOString().split('T')[0],
        status: employee.status || 'Active',
        lifecycle: employee.lifecycle || 'Active',
        role: employee.role || 'employee',
        annual_leave_days: employee.annual_leave_days || 25,
        sick_leave_days: employee.sick_leave_days || 10,
      });
    }
  }, [employee]);

  // Additional effect to ensure real-time synchronization when dialog opens
  React.useEffect(() => {
    if (isOpen && employee) {
      // Reset form data to ensure it reflects the current employee state
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        location: employee.site || 'Office',
        loginEmail: employee.email || '',
        password: '123Qwe@×',
        firstName: employee.name?.split(' ')[0] || '',
        lastName: employee.name?.split(' ')[1] || '',
        position: employee.jobTitle || '',
        department: employee.department || '',
        managerId: employee.managerId || '',
        job_title: employee.jobTitle || '',
        salary: Number(employee.salary?.replace(/[£,]/g, '') || 0),
        start_date: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: employee.status || 'Active',
        lifecycle: employee.lifecycle || 'Active',
        role: employee.role || 'employee',
        annual_leave_days: employee.annual_leave_days || 25,
        sick_leave_days: employee.sick_leave_days || 10,
      });
    }
  }, [isOpen, employee]);

  if (!employee) return null;

  // Calculate salary breakdown with memoization for performance
  const salaryBreakdown = useMemo(() => {
    const annualSalary = formData.salary || 0;
    const monthlySalary = annualSalary / 12;
    const weeklySalary = annualSalary / 52;
    const dailySalary = annualSalary / 260; // Assuming 260 working days per year
    const hourlySalary = annualSalary / (40 * 52); // Assuming 40 hours per week
    
    return {
      annual: annualSalary,
      monthly: monthlySalary,
      weekly: weeklySalary,
      daily: dailySalary,
      hourly: hourlySalary
    };
  }, [formData.salary]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormError(null); // Clear form errors on input change
    
    // Improved viewport handling for mobile
    const scrollContainer = document.querySelector('[data-scroll-container="true"]') || 
                           document.querySelector('.overflow-y-scroll') ||
                           document.querySelector('[style*="overflow-y: scroll"]');
    const currentScrollTop = scrollContainer?.scrollTop || 0;
    const activeElement = document.activeElement as HTMLElement;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setFormData(prev => {
        const updated = { ...prev };
        
        // Handle salary field specifically to ensure proper number conversion
        if (field === 'salary') {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          updated[field] = isNaN(numValue) || numValue < 0 ? 0 : numValue;
        } else {
          updated[field] = value;
        }
        
        // Sync email fields to ensure both are updated
        if (field === 'email') {
          updated.loginEmail = value;
        } else if (field === 'loginEmail') {
          updated.email = value;
        }
        
        return updated;
      });

      // Restore scroll position and focus using RAF for better performance
      requestAnimationFrame(() => {
        if (scrollContainer && scrollContainer.scrollTop !== currentScrollTop) {
          scrollContainer.scrollTo({ top: currentScrollTop, behavior: 'instant' });
        }
        // Maintain focus if the active element lost focus
        if (activeElement && document.activeElement !== activeElement && activeElement.focus) {
          activeElement.focus({ preventScroll: true });
        }
      });
    });
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Form validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required');
      }
      if (!formData.loginEmail.trim()) {
        throw new Error('Email address is required');
      }
      if (!formData.position.trim()) {
        throw new Error('Job title is required');
      }
      if (!formData.salary || formData.salary <= 0) {
        throw new Error('Valid salary is required');
      }

      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Ensure salary is never null/undefined and is a valid number
      const validSalary = Math.max(0, Number(formData.salary) || 0);
      
      // Prepare update data with all required fields and proper validation
      const updateData = {
        id: employee.id,
        name: fullName || formData.name || employee.name,
        email: formData.loginEmail || formData.email || employee.email,
        job_title: formData.job_title || formData.position || employee.jobTitle,
        department: formData.department || employee.department,
        salary: validSalary,
        site: formData.location || employee.site,
        start_date: formData.start_date || employee.startDate,
        status: formData.status || employee.status,
        lifecycle: formData.lifecycle || employee.lifecycle,
        role: formData.role || employee.role,
        annual_leave_days: Math.max(0, Number(formData.annual_leave_days) || 25),
        sick_leave_days: Math.max(0, Number(formData.sick_leave_days) || 10),
        manager_id: formData.managerId || null,
      };

      // Prepare sync data for the sync hook with correct field mappings
      const syncData = {
        id: employee.id,
        name: updateData.name,
        email: updateData.email,
        jobTitle: updateData.job_title,
        department: updateData.department,
        salary: updateData.salary,
        site: updateData.site,
        startDate: updateData.start_date,
        status: updateData.status,
        lifecycle: updateData.lifecycle,
        role: updateData.role,
        annual_leave_days: updateData.annual_leave_days,
        sick_leave_days: updateData.sick_leave_days,
        managerId: updateData.manager_id || undefined,
      };

      // First update the employee record
      await updateEmployee.mutateAsync(updateData);

      // Then sync with manager team
      await syncEmployee(syncData);

      toast({
        title: "Account updated & synchronized",
        description: `${updateData.name}'s account updated successfully. All changes have been synchronized with the manager team.`,
        variant: "default"
      });

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update account";
      setFormError(errorMessage);
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, employee, updateEmployee, syncEmployee, toast, onClose]);

  const MobileContent = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      
      // Handle viewport changes for mobile keyboards
      const handleViewportChange = () => {
        const visualViewport = window.visualViewport;
        if (visualViewport) {
          const scale = visualViewport.scale;
          const viewportHeight = visualViewport.height;
          const windowHeight = window.innerHeight;
          
          // Calculate available height accounting for keyboard
          const availableHeight = Math.min(viewportHeight, windowHeight * 0.9);
          container.style.height = `${availableHeight}px`;
        }
      };
      
      // Handle input focus to prevent jumping
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
          setTimeout(() => {
            target.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }, 300); // Wait for keyboard animation
        }
      };
      
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange);
        handleViewportChange(); // Initial call
      }
      
      container.addEventListener('focusin', handleFocusIn);
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        container.removeEventListener('focusin', handleFocusIn);
      };
    }, []);
    
    return (
      <FormErrorBoundary onError={(error) => setFormError(error.message)}>
        <div 
          ref={containerRef}
          className="flex flex-col h-[90vh] bg-background relative mobile-viewport"
          style={{ 
            maxHeight: '90vh',
            contain: 'layout style paint',
            overscrollBehavior: 'contain'
          }}
        >
          <LoadingOverlay isVisible={isSubmitting} message="Updating account..." />
          
          <MobileHeader 
            employeeName={employee?.name || 'Employee'} 
            onClose={onClose}
            isLoading={isSubmitting}
          />
          
          <div 
            className="flex-1 overflow-y-auto ios-scroll-container pb-24" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain',
              contain: 'layout style paint',
              willChange: 'scroll-position'
            }} 
            data-scroll-container="true"
          >
            <form onSubmit={handleFormSubmit} className="px-4 py-6 space-y-6 ios-form-container">
              <ErrorMessage error={formError} onDismiss={() => setFormError(null)} />
              
              <PersonalInfoSection 
                formData={formData}
                handleInputChange={handleInputChange}
                isLoading={isSubmitting}
              />

              <Separator className="my-6" />
              
              <LoginInfoSection 
                formData={formData}
                handleInputChange={handleInputChange}
                isLoading={isSubmitting}
              />
              
              <Separator className="my-6" />
              
              <EmploymentDetailsSection 
                formData={formData}
                handleInputChange={handleInputChange}
                isLoading={isSubmitting}
              />
              
              <Separator className="my-6" />
              
              <SalarySection 
                formData={formData}
                handleInputChange={handleInputChange}
                salaryBreakdown={salaryBreakdown}
                isLoading={isSubmitting}
              />
            </form>
          </div>
          
          <FormActions
            onCancel={onClose}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
            disabled={!formData.firstName.trim() || !formData.lastName.trim() || !formData.loginEmail.trim()}
          />
        </div>
      </FormErrorBoundary>
    );
  };

  const DesktopContent = () => (
    <FormErrorBoundary onError={(error) => setFormError(error.message)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit Employee Account
            <LoadingState 
              state={isSubmitting ? 'loading' : 'idle'} 
              loadingText="Updating..."
              size="sm"
            />
          </DialogTitle>
          <DialogDescription>
            Update {employee?.name || 'employee'}'s account information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto px-6 py-4">
          <ErrorMessage error={formError} onDismiss={() => setFormError(null)} />
          
          <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <PersonalInfoSection 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  isLoading={isSubmitting}
                />
                
                <LoginInfoSection 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  isLoading={isSubmitting}
                />
              </div>
              
              <div className="space-y-6">
                <EmploymentDetailsSection 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  isLoading={isSubmitting}
                />
                
                <SalarySection 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  salaryBreakdown={salaryBreakdown}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleFormSubmit}
            disabled={isSubmitting || !formData.firstName.trim() || !formData.lastName.trim() || !formData.loginEmail.trim()}
            className="flex items-center gap-2"
          >
            <LoadingState 
              state={isSubmitting ? 'loading' : 'idle'} 
              loadingText="Updating..."
              size="sm"
              showIcon={isSubmitting}
            />
            {isSubmitting ? 'Updating Account...' : 'Update Account'}
          </Button>
        </div>
      </DialogContent>
    </FormErrorBoundary>
  );

  return (
    <ErrorBoundary>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent 
            side="bottom" 
            className="h-[90vh] rounded-t-2xl p-0 border-0 bg-background"
            style={{
              maxHeight: '90vh',
              height: 'min(90vh, 100dvh - 60px)'
            }}
          >
            <MobileContent />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DesktopContent />
        </Dialog>
      )}
    </ErrorBoundary>
  );
};

export default React.memo(EmployeeAccountEditDialog, (prev, next) => {
  return prev.isOpen === next.isOpen && prev.onClose === next.onClose && (prev.employee?.id === next.employee?.id);
});