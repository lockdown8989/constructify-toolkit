
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Pause, CheckCircle, Clock, AlertCircle, Pound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  salary: string;
  status: string;
  overtime: string;
  avatar: string;
}

interface PayrollProcessingTabProps {
  employees: Employee[];
}

export const PayrollProcessingTab: React.FC<PayrollProcessingTabProps> = ({ employees }) => {
  const { toast } = useToast();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedEmployees, setProcessedEmployees] = useState<string[]>([]);

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select employees to process payroll.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payroll processing
      for (const employeeId of selectedEmployees) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
        
        // In a real implementation, you would:
        // 1. Calculate final salary based on attendance
        // 2. Apply deductions and bonuses
        // 3. Generate payslip
        // 4. Update payroll records
        
        const { error } = await supabase
          .from('payroll')
          .upsert({
            employee_id: employeeId,
            payment_date: new Date().toISOString().split('T')[0],
            salary_paid: Math.random() * 5000 + 2000, // Mock calculation
            payment_status: 'processed',
            processing_date: new Date().toISOString()
          });

        if (error) {
          console.error('Error processing payroll:', error);
        } else {
          setProcessedEmployees(prev => [...prev, employeeId]);
        }
      }

      toast({
        title: "Payroll Processed",
        description: `Successfully processed payroll for ${selectedEmployees.length} employees.`,
      });

      setSelectedEmployees([]);
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process payroll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (employeeId: string) => {
    if (processedEmployees.includes(employeeId)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (isProcessing && selectedEmployees.includes(employeeId)) {
      return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const totalSalary = selectedEmployees.reduce((total, employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      // Extract numeric value from formatted salary string
      const salaryValue = parseFloat(employee.salary.replace(/[£,]/g, ''));
      return total + (salaryValue || 0);
    }
    return total;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected Employees</CardTitle>
            <Pound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Ready for processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Pound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalary)}</div>
            <p className="text-xs text-muted-foreground">To be processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
            {isProcessing ? (
              <Pause className="h-4 w-4 text-blue-600" />
            ) : (
              <Play className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isProcessing ? 'Running' : 'Ready'}
            </div>
            <p className="text-xs text-muted-foreground">
              {processedEmployees.length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Selection</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleProcessPayroll}
                disabled={selectedEmployees.length === 0 || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Processing...' : `Process Payroll (${selectedEmployees.length})`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEmployees.length === employees.length && employees.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processing Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={() => handleSelectEmployee(employee.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell className="font-medium">{employee.salary}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'Paid' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(employee.id)}
                      <span className="text-sm">
                        {processedEmployees.includes(employee.id) 
                          ? 'Processed' 
                          : isProcessing && selectedEmployees.includes(employee.id)
                          ? 'Processing...'
                          : 'Pending'
                        }
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
