import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Filter, Search, Grid, List, Settings, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  salary: string;
  status: string;
  overtime: string;
  avatar: string;
  payrollHistory?: any[]; // Add this optional property
}

interface PayrollEmployeeTableProps {
  employees: Employee[];
  actualEmployeeCount: number;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const PayrollEmployeeTable: React.FC<PayrollEmployeeTableProps> = ({
  employees,
  actualEmployeeCount,
  searchQuery,
  viewMode,
  isLoading,
  onSearchChange,
  onViewModeChange
}) => {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = React.useState(false);
  const [showEmployeeSettings, setShowEmployeeSettings] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState<{ [key: string]: boolean }>({});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEmployeeSettings = async (employee: Employee) => {
    setIsProcessing(prev => ({ ...prev, [employee.id]: true }));
    
    try {
      const { data: employeeData, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employee.id)
        .single();

      if (error) throw error;

      setSelectedEmployee({ ...employee, ...employeeData });
      setShowEmployeeSettings(true);
      
      toast({
        title: "Employee Settings",
        description: `Opening payroll settings for ${employee.name}`,
      });
    } catch (error) {
      console.error('Error fetching employee settings:', error);
      toast({
        title: "Error",
        description: "Failed to load employee settings",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [employee.id]: false }));
    }
  };

  const handleViewEmployee = async (employee: Employee) => {
    setIsProcessing(prev => ({ ...prev, [employee.id]: true }));
    
    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employee.id)
        .single();

      if (employeeError) throw employeeError;

      const { data: payrollHistory, error: payrollError } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employee.id)
        .order('payment_date', { ascending: false })
        .limit(5);

      if (payrollError) {
        console.error('Error fetching payroll history:', payrollError);
      }

      setSelectedEmployee({ 
        ...employee, 
        ...employeeData,
        payrollHistory: payrollHistory || []
      });
      setShowEmployeeDetails(true);

      toast({
        title: "Employee Details",
        description: `Viewing payroll details for ${employee.name}`,
      });
    } catch (error) {
      console.error('Error loading employee details:', error);
      toast({
        title: "Error",
        description: "Failed to load employee details",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [employee.id]: false }));
    }
  };

  const handleStatusUpdate = async (employeeId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payroll')
        .update({ payment_status: newStatus.toLowerCase() })
        .eq('employee_id', employeeId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Employee payroll status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee ({actualEmployeeCount} total)
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search employees"
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading employees...</span>
            </div>
          ) : actualEmployeeCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Salary</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Recurring</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Overtime</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{employee.position}</td>
                      <td className="py-3 px-4 font-medium">{employee.salary}</td>
                      <td className="py-3 px-4 text-gray-600">Recurring</td>
                      <td className="py-3 px-4 text-gray-600">{employee.overtime}</td>
                      <td className="py-3 px-4">{getStatusBadge(employee.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEmployeeSettings(employee)}
                            disabled={isProcessing[employee.id]}
                            title="Payroll Settings"
                          >
                            {isProcessing[employee.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Settings className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewEmployee(employee)}
                            disabled={isProcessing[employee.id]}
                            title="View Employee Details"
                          >
                            {isProcessing[employee.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={showEmployeeDetails} onOpenChange={setShowEmployeeDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Payroll Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-gray-600">{selectedEmployee.position}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Base Salary</label>
                  <p className="text-lg font-semibold">{selectedEmployee.salary}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Status</label>
                  <div>{getStatusBadge(selectedEmployee.status)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Overtime</label>
                  <p className="text-lg">{selectedEmployee.overtime}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pay Type</label>
                  <p className="text-lg">Recurring</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Recent Payroll History</h4>
                <div className="border rounded-lg p-4">
                  {selectedEmployee.payrollHistory && selectedEmployee.payrollHistory.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.payrollHistory.map((record: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="text-sm">
                            {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="font-medium">
                            £{record.salary_paid?.toFixed(2) || '0.00'}
                          </span>
                          <Badge variant={record.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {record.payment_status || 'pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No payroll history available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Settings Dialog */}
      <Dialog open={showEmployeeSettings} onOpenChange={setShowEmployeeSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payroll Settings</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                <p className="text-gray-600">{selectedEmployee.position}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Update Payment Status:</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedEmployee.id, 'Pending')}
                    >
                      Mark Pending
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleStatusUpdate(selectedEmployee.id, 'Paid')}
                    >
                      Mark Paid
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Generate Payslip:</span>
                  <Button size="sm" variant="outline">
                    Download PDF
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <span>Process Payment:</span>
                  <Button size="sm" variant="outline">
                    Process Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
