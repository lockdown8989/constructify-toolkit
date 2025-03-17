
import React, { useState } from 'react';
import { EmployeeForm } from './EmployeeForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useEmployee } from '@/hooks/use-employees';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface EmployeeManagementProps {
  selectedEmployeeId?: string;
}

export function EmployeeManagement({ selectedEmployeeId }: EmployeeManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | undefined>(selectedEmployeeId);
  
  const { data: employeeData, isLoading } = useEmployee(currentEmployeeId);
  
  const handleOpenDialog = (employeeId?: string) => {
    setCurrentEmployeeId(employeeId);
    setIsDialogOpen(true);
  };
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>Add, update or remove employees from your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(undefined)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentEmployeeId ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogDescription>
                  {currentEmployeeId 
                    ? 'Update the employee information using the form below.' 
                    : 'Add a new employee to your organization using the form below.'}
                </DialogDescription>
              </DialogHeader>
              
              {(currentEmployeeId && isLoading) ? (
                <div className="p-8 text-center">Loading employee data...</div>
              ) : (
                <EmployeeForm 
                  employeeId={currentEmployeeId}
                  defaultValues={employeeData ? {
                    name: employeeData.name,
                    job_title: employeeData.job_title,
                    department: employeeData.department,
                    site: employeeData.site,
                    salary: employeeData.salary,
                    status: employeeData.status,
                  } : undefined}
                  onSuccess={handleSuccess}
                />
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Employees added here will appear in your people directory
        </CardFooter>
      </Card>
    </div>
  );
}
