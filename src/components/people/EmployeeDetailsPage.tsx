
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Download, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { useEmployee } from '@/hooks/use-employees';
import { mapDbEmployeeToUiEmployee } from './types';
import EmployeeInfoSection from './modals/employee-details/EmployeeInfoSection';
import { useAuth } from '@/hooks/use-auth';
import { DocumentIcon } from 'lucide-react';

const EmployeeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { data: employeeData, isLoading, error } = useEmployee(id);
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading employee details...</div>;
  }
  
  if (error || !employeeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold mb-2">Employee Not Found</h2>
        <p className="text-apple-gray-600 mb-4">The employee you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/people')}>Back to Employees</Button>
      </div>
    );
  }
  
  const employee = mapDbEmployeeToUiEmployee(employeeData);
  
  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100 -ml-3"
          onClick={() => navigate('/people')}
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to Employees
        </Button>
        
        <Card className="overflow-hidden rounded-2xl border border-apple-gray-200 shadow-sm">
          <div className="h-40 bg-gradient-to-r from-apple-blue/90 to-apple-indigo/90 relative">
            <div className="absolute -bottom-16 w-full flex justify-center">
              <Avatar className="h-32 w-32 border-4 border-white rounded-full shadow-md">
                <AvatarImage src={employee.avatar} alt={employee.name} className="object-cover" />
                <AvatarFallback className="text-2xl font-medium bg-apple-blue text-white">{getInitials(employee.name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-6 text-center">
            <h1 className="text-2xl font-semibold text-apple-gray-900 mb-1">{employee.name}</h1>
            <p className="text-apple-gray-600">{employee.jobTitle}</p>
            
            <div className="mt-4 flex justify-center">
              <Badge variant="outline" className={
                employee.status === 'Active' 
                  ? 'bg-apple-green/15 text-apple-green' 
                  : 'bg-apple-gray-200 text-apple-gray-700'
              }>
                {employee.status}
              </Badge>
            </div>
            
            <Separator className="my-6" />
            
            <EmployeeInfoSection employee={employee} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;
