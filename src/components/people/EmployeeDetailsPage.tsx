
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Download, Cake, Phone, Mail, Globe, MapPin, Home } from 'lucide-react';
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
import EmployeeStatistics from './EmployeeStatistics';
import DocumentsSection from './modals/employee-details/DocumentsSection';
import { Progress } from '@/components/ui/progress';

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
  
  // Generate some mock personal data that matches the image design
  const personalInfo = {
    birthday: '26 September 1998',
    phone: `+1 (${Math.floor(100 + Math.random() * 900)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    email: `${employee.name.toLowerCase().replace(/\s/g, '.')}@company.com`,
    citizenship: 'United States',
    city: employee.site === 'Remote' ? 'Remote' : 'New York',
    address: employee.site === 'Remote' ? 'Remote Worker' : '10001 Company Street'
  };
  
  // Mock statistics for leave days
  const statistics = {
    holidayLeft: employee.annual_leave_days || 25,
    sickDaysLeft: employee.sick_leave_days || 10,
    totalHolidays: 30,
    totalSickDays: 15
  };
  
  return (
    <div className="pt-16 md:pt-20 px-4 sm:px-6 pb-10 animate-fade-in bg-gradient-to-b from-white to-apple-gray-50">
      <div className="max-w-lg mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100 -ml-3"
          onClick={() => navigate('/people')}
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to Employees
        </Button>
        
        <Card className="overflow-hidden rounded-3xl border border-apple-gray-200 shadow-sm bg-white">
          {/* Header with colorful gradient background */}
          <div className="h-40 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 relative">
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
              <Avatar className="h-32 w-32 border-4 border-white rounded-full shadow-md">
                <AvatarImage src={employee.avatar} alt={employee.name} className="object-cover" />
                <AvatarFallback className="text-2xl font-medium bg-apple-blue text-white">{getInitials(employee.name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Employee name and position */}
          <div className="pt-20 px-6 text-center">
            <h1 className="text-3xl font-semibold text-apple-gray-900 mb-1">{employee.name}</h1>
            <p className="text-xl text-apple-gray-600 mb-4">{employee.jobTitle}</p>
            
            <div className="mt-2 mb-6 flex justify-center">
              <Badge variant="outline" className={
                employee.status === 'Active' 
                  ? 'bg-apple-green/15 text-apple-green' 
                  : 'bg-apple-gray-200 text-apple-gray-700'
              }>
                {employee.status}
              </Badge>
            </div>
            
            <Separator className="my-6" />
            
            {/* Basic Information Section */}
            <div className="text-left">
              <h2 className="text-2xl font-medium text-apple-gray-900 mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <Cake className="h-6 w-6 text-apple-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Birthday</p>
                    <p className="text-base text-apple-gray-900">{personalInfo.birthday}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <Phone className="h-6 w-6 text-apple-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Phone number</p>
                    <p className="text-base text-apple-gray-900">{personalInfo.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <Mail className="h-6 w-6 text-apple-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">E-Mail</p>
                    <p className="text-base text-apple-gray-900">{personalInfo.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <Globe className="h-6 w-6 text-apple-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Citizenship</p>
                    <p className="text-base text-apple-gray-900">{personalInfo.citizenship}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <MapPin className="h-6 w-6 text-apple-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">City</p>
                    <p className="text-base text-apple-gray-900">{personalInfo.city}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <Home className="h-6 w-6 text-apple-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Address</p>
                    <p className="text-base text-apple-gray-900">{personalInfo.address}</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              {/* Documents Section */}
              <h2 className="text-2xl font-medium text-apple-gray-900 mb-6">Documents</h2>
              <DocumentsSection employee={employee} />
              
              <Separator className="my-8" />
              
              {/* Statistics Section */}
              <h2 className="text-2xl font-medium text-apple-gray-900 mb-6">Statistics</h2>
              
              <div className="space-y-8 mb-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xl font-semibold text-apple-gray-900">Holiday left:</p>
                    <p className="text-xl font-semibold text-apple-gray-900">{statistics.holidayLeft} days</p>
                  </div>
                  <Progress value={(statistics.holidayLeft / statistics.totalHolidays) * 100} className="h-4 bg-apple-gray-200" indicatorClassName="bg-amber-400" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xl font-semibold text-apple-gray-900">Sickness:</p>
                    <p className="text-xl font-semibold text-apple-gray-900">{statistics.sickDaysLeft} days</p>
                  </div>
                  <Progress value={(statistics.sickDaysLeft / statistics.totalSickDays) * 100} className="h-4 bg-apple-gray-200" indicatorClassName="bg-black" />
                </div>
              </div>
              
              {/* Work information section */}
              <Separator className="my-8" />
              
              <h2 className="text-2xl font-medium text-apple-gray-900 mb-6">Work Information</h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Department</p>
                    <p className="text-base text-apple-gray-900">{employee.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Position</p>
                    <p className="text-base text-apple-gray-900">{employee.jobTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Start Date</p>
                    <p className="text-base text-apple-gray-900">{employee.startDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-gray-500">Salary</p>
                    <p className="text-base text-apple-gray-900">{employee.salary}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;
