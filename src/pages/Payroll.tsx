import React, { useState } from 'react';
import SalaryTable from '@/components/dashboard/SalaryTable';
import { useEmployees } from '@/hooks/use-employees';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, subMonths } from 'date-fns';
import { DollarSign, Calendar, ArrowUpRight, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/export-utils';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeSalary {
  id: string;
  name: string;
  avatar: string;
  title: string;
  salary: string;
  status: 'Paid' | 'Absent' | 'Pending';
  selected?: boolean;
  paymentDate?: string;
}

const calculateSalaries = (employees: any[]): EmployeeSalary[] => {
  return employees.map(employee => {
    const statusRand = Math.random();
    let status: 'Paid' | 'Absent' | 'Pending';
    let paymentDate: string | undefined;
    
    if (statusRand < 0.7) {
      status = 'Paid';
      const randomDay = Math.floor(Math.random() * 7);
      const date = new Date();
      date.setDate(date.getDate() - randomDay);
      paymentDate = format(date, 'MMM d, yyyy');
    } else if (statusRand < 0.9) {
      status = 'Pending';
      paymentDate = undefined;
    } else {
      status = 'Absent';
      paymentDate = undefined;
    }
    
    return {
      id: employee.id,
      name: employee.name,
      avatar: employee.avatar || '/placeholder.svg',
      title: employee.job_title,
      salary: `$${employee.salary.toLocaleString()}`,
      status,
      selected: false,
      paymentDate
    };
  });
};

const PayrollPage = () => {
  const { data: employeesData = [] } = useEmployees();
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  const [employees, setEmployees] = useState<EmployeeSalary[]>([]);
  
  React.useEffect(() => {
    if (employeesData.length > 0) {
      setEmployees(calculateSalaries(employeesData));
    }
  }, [employeesData]);
  
  const handleSelectEmployee = (id: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, selected: !emp.selected } : emp
    ));
    
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleUpdateStatus = (id: string, status: 'Paid' | 'Absent' | 'Pending') => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const paymentDate = status === 'Paid' ? format(new Date(), 'MMM d, yyyy') : undefined;
        return { ...emp, status, paymentDate };
      }
      return emp;
    }));
    
    toast({
      title: `Employee status updated`,
      description: `Payment status has been set to ${status}.`,
    });
  };
  
  const handleProcessPayroll = () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to process payroll.",
        variant: "destructive"
      });
      return;
    }
    
    setEmployees(employees.map(emp => {
      if (selectedEmployees.has(emp.id)) {
        return { 
          ...emp, 
          status: 'Paid', 
          paymentDate: format(new Date(), 'MMM d, yyyy'),
          selected: false
        };
      }
      return emp;
    }));
    
    setSelectedEmployees(new Set());
    
    toast({
      title: "Payroll processed successfully",
      description: `Processed payments for ${selectedEmployees.size} employees.`,
    });
  };
  
  const handleExportPayroll = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from("payroll")
        .select(`
          id,
          net_salary,
          payment_status,
          payment_date,
          employee_id,
          employees(name, job_title)
        `);

      if (error) {
        console.error("Error fetching payroll:", error);
        toast({
          title: "Export failed",
          description: "Could not fetch payroll data for export.",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There is no payroll data available for export.",
          variant: "destructive"
        });
        return;
      }

      const exportData = data.map(row => ({
        ID: row.id,
        Employee: row.employees?.name || 'Unknown',
        Position: row.employees?.job_title || 'Unknown',
        'Employee ID': row.employee_id,
        'Net Salary': row.net_salary,
        'Payment Date': row.payment_date,
        Status: row.payment_status
      }));

      exportToCSV(exportData, `payroll_report_${format(new Date(), 'yyyy-MM-dd')}`, {
        ID: 'ID',
        Employee: 'Employee Name',
        Position: 'Job Title',
        'Employee ID': 'Employee ID',
        'Net Salary': 'Net Salary',
        'Payment Date': 'Payment Date',
        Status: 'Payment Status'
      });

      toast({
        title: "Export successful",
        description: "Payroll data has been exported to CSV.",
      });
    } catch (err) {
      console.error("Error exporting payroll:", err);
      toast({
        title: "Export failed",
        description: "An unexpected error occurred while exporting payroll data.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const totalEmployees = employees.length;
  const paidEmployees = employees.filter(e => e.status === 'Paid').length;
  const pendingEmployees = employees.filter(e => e.status === 'Pending').length;
  const absentEmployees = employees.filter(e => e.status === 'Absent').length;
  
  const totalPayroll = employees.reduce((sum, emp) => {
    const salary = parseInt(emp.salary.replace(/\$|,/g, ''), 10);
    return sum + (emp.status !== 'Absent' ? salary : 0);
  }, 0);
  
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const previousMonth = format(subMonths(new Date(), 1), 'MMMM yyyy');
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Payroll Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payroll</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <DollarSign className="h-5 w-5 mr-1 text-gray-500" />
              ${totalPayroll.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              For {totalEmployees} employees
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Period</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <Calendar className="h-5 w-5 mr-1 text-gray-500" />
              {currentMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
              5% increase from {previousMonth}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payment Status</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-1 text-green-500" />
                {paidEmployees}
              </div>
              <div className="text-sm text-gray-500">paid</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                <span className="text-sm">{pendingEmployees} pending</span>
              </div>
              <div className="flex items-center">
                <XCircle className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm">{absentEmployees} absent</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-300">Quick Actions</CardDescription>
            <CardTitle className="text-xl">Process Payroll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full bg-white text-black hover:bg-gray-100"
              onClick={handleProcessPayroll}
            >
              Process Selected ({selectedEmployees.size})
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white text-white hover:bg-white/10"
              onClick={handleExportPayroll}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Payroll CSV'}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList className="mb-6">
          <TabsTrigger value="current">Current Month</TabsTrigger>
          <TabsTrigger value="previous">Previous Month</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <SalaryTable 
            employees={employees}
            onSelectEmployee={handleSelectEmployee}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
        
        <TabsContent value="previous">
          <div className="bg-white rounded-3xl p-6 text-center py-12">
            <h3 className="text-xl font-medium mb-2">Previous Month's Payroll</h3>
            <p className="text-gray-500">Payroll data for {previousMonth} is archived.</p>
            <Button className="mt-4" variant="outline">
              View Archive
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="bg-white rounded-3xl p-6 text-center py-12">
            <h3 className="text-xl font-medium mb-2">Payment History</h3>
            <p className="text-gray-500">View detailed payment history and generate reports.</p>
            <Button className="mt-4" variant="outline">
              Generate Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollPage;
