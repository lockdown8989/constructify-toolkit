
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployees } from '@/hooks/use-employees';
import EmployeeHeader from './modals/employee-details/EmployeeHeader';
import EmployeeInfoSection from './modals/employee-details/EmployeeInfoSection';
import DocumentsSection from './modals/employee-details/DocumentsSection';
import { mapDbEmployeeToUiEmployee } from './types';

const EmployeeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employees, isLoading } = useEmployees();
  
  const dbEmployee = employees?.find(emp => emp.id === id);
  const employee = dbEmployee ? mapDbEmployeeToUiEmployee(dbEmployee) : null;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Employee Not Found</h2>
          <Button onClick={() => navigate('/people')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to People
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/people')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to People
        </Button>
        <h1 className="text-3xl font-bold">Employee Details</h1>
      </div>

      {/* Employee Header Card */}
      <Card>
        <CardContent className="p-6">
          <EmployeeHeader
            employee={employee}
            onDelete={() => {}}
          />
        </CardContent>
      </Card>

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeInfoSection 
            employee={employee}
            isEditing={false}
            onSave={() => {}}
          />
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentsSection 
            employeeId={employee.id}
            employeeName={employee.name}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetailsPage;
