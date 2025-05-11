
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, Briefcase, MapPin, Clock, Mail, Phone, ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Employee } from '../../types';
import { useIsMobile } from '@/hooks/use-mobile';
import DocumentsSection from './DocumentsSection';
import { Card, CardContent, CardDescription } from '@/components/ui/card';

interface EmployeeInfoSectionProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 mr-2 hover:bg-transparent" 
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium">Employee Details</h2>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-2">Employee Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">{employee.jobTitle}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">{employee.site}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">Start date: {formatDate(employee.startDate)}</span>
                    </div>
                    
                    {employee.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">{employee.email}</span>
                      </div>
                    )}
                    
                    {employee.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">{employee.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="text-sm font-medium mb-2">Department</h3>
                  <div className="flex items-center text-sm">
                    {employee.department}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Time Off Balance</h3>
                    <Button variant="link" size="sm" className="p-0">
                      <span className="text-xs">View history</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-xs">Annual Leave</span>
                      </div>
                      <span className="font-medium text-sm">{employee.annual_leave_days || 25} days</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-xs">Sick Leave</span>
                      </div>
                      <span className="font-medium text-sm">{employee.sick_leave_days || 10} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Compensation</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-500">Base Salary</span>
                      <span className="font-medium">{employee.salary}</span>
                    </div>
                    {employee.hourly_rate && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-500">Hourly Rate</span>
                        <span className="font-medium">${employee.hourly_rate}/hr</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-500">Payment Schedule</span>
                      <span className="text-sm">Monthly</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentsSection employeeId={employee.id} />
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardContent className="pt-6">
              <CardDescription>
                Attendance records will be shown here.
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeInfoSection;
