
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeManagement } from '@/components/people/EmployeeManagement';
import { AttendanceTracker } from '@/components/attendance/AttendanceTracker';

const EmployeesManagementPage = () => {
  return (
    <div className="container py-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Employees Management</h1>
      
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="management">Employee Management</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management">
          <EmployeeManagement />
        </TabsContent>
        
        <TabsContent value="attendance">
          <AttendanceTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeesManagementPage;
