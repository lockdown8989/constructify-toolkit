
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useEmployees } from '@/hooks/use-employees';
import { Download } from 'lucide-react';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';
import { toast } from '@/components/ui/use-toast';

interface SalaryOverviewProps {
  onDownloadSuccess?: () => void;
}

const SalaryOverview: React.FC<SalaryOverviewProps> = ({ onDownloadSuccess }) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const { employeeId } = useEmployeeDataManagement();
  const { data: employees } = useEmployees();
  
  // Find the current employee's data
  const currentEmployee = employees?.find(emp => emp.user_id === user?.id);
  
  const handleDownload = async () => {
    if (!currentEmployee) {
      toast({
        title: "Error",
        description: "Could not find your employee data",
        variant: "destructive"
      });
      return;
    }
    
    setDownloading(true);
    try {
      await generatePayslipPDF({
        employee: {
          name: currentEmployee.name,
          position: currentEmployee.job_title,
          department: currentEmployee.department,
          startDate: currentEmployee.start_date,
        },
        salary: {
          base: currentEmployee.salary,
          bonus: 0,
          deductions: 0,
          total: currentEmployee.salary,
        },
        payPeriod: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
        paymentDate: new Date().toLocaleDateString(),
        paymentMethod: 'Direct Deposit',
        paymentId: `PAY-${Date.now().toString().substring(5)}`,
      });
      
      toast({
        title: "Success",
        description: "Your payslip has been downloaded",
        variant: "default"
      });
      
      if (onDownloadSuccess) {
        onDownloadSuccess();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate payslip",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold">Salary Overview</h3>
          <p className="text-sm text-gray-500">View and download your salary information</p>
        </div>
        <Button 
          className="mt-3 md:mt-0" 
          onClick={handleDownload}
          disabled={downloading || !currentEmployee}
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
      
      <div className="mt-4">
        {currentEmployee ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{currentEmployee.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{currentEmployee.job_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{currentEmployee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Salary</p>
                <p className="font-medium">${currentEmployee.salary.toLocaleString()}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No salary information available</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalaryOverview;
