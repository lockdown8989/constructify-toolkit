
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar, FileText } from 'lucide-react';
import DocumentList from './components/DocumentList';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import { Skeleton } from '@/components/ui/skeleton';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';
import { useToast } from '@/hooks/use-toast';
import { PayslipData } from '@/types/supabase/payroll';

const SalaryOverview = () => {
  const { user } = useAuth();
  const { data: employees = [], isLoading } = useEmployees();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Find the current user's employee data
  const currentEmployeeData = user ? employees.find(emp => emp.user_id === user.id) : null;
  
  const handleDownloadPdf = async () => {
    if (!currentEmployeeData) {
      toast({
        title: "Error",
        description: "Employee data not found",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    try {
      // Create a PayslipData object instead of passing the ID directly
      const payslipData: PayslipData = {
        id: currentEmployeeData.id,
        employeeId: currentEmployeeData.id,
        employeeName: currentEmployeeData.name,
        position: currentEmployeeData.job_title,
        department: currentEmployeeData.department,
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        paymentDate: new Date().toISOString(),
        baseSalary: currentEmployeeData.salary,
        grossPay: currentEmployeeData.salary,
        deductions: 0,
        netPay: currentEmployeeData.salary,
        currency: 'USD',
        overtimePay: 0,
        bonus: 0,
        totalPay: currentEmployeeData.salary
      };
      
      await generatePayslipPDF(payslipData);
      toast({
        title: "Success",
        description: "Payslip PDF has been downloaded",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download payslip PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!currentEmployeeData) {
    return (
      <div className="container py-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
          <p>No employee data found for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Salary Overview</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            View History
          </Button>
          
          <Button onClick={handleDownloadPdf} disabled={isDownloading} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentEmployeeData.salary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next payment: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentEmployeeData.department}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Position: {currentEmployeeData.job_title}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Employment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentEmployeeData.status}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Since: {new Date(currentEmployeeData.start_date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
        <DocumentList employeeId={currentEmployeeData.id} />
      </div>
    </div>
  );
};

export default SalaryOverview;
