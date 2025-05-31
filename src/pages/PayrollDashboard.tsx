import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DollarSign, TrendingUp, Users, Download, Settings, Filter, Grid, List, Search, Calendar, Clock, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePayroll } from '@/hooks/use-payroll';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/components/dashboard/salary-table/types';

const PayrollDashboard = () => {
  const { user, isPayroll } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeView, setTimeView] = useState('Month');
  const [selectedPeriod, setSelectedPeriod] = useState('26 Jan 2024 — 25 Feb 2024');
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  
  // Redirect if not payroll user
  if (!isPayroll) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">This page is only accessible to payroll users.</p>
        </div>
      </div>
    );
  }

  // Fetch employees data
  const { data: dbEmployees = [], isLoading } = useQuery({
    queryKey: ['employees-payroll'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          name,
          job_title,
          department,
          salary,
          status,
          user_id
        `)
        .eq('status', 'Active');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Transform database employees to match the Employee interface expected by usePayroll
  const employees: Employee[] = dbEmployees.map(emp => ({
    id: emp.id,
    name: emp.name,
    title: emp.job_title, // Map job_title to title
    salary: emp.salary || 0,
    status: Math.random() > 0.2 ? 'Paid' : 'Pending' as 'Paid' | 'Absent' | 'Pending', // Random status for demo
    paymentDate: format(new Date(), 'yyyy-MM-dd'), // Add current date as payment date
    department: emp.department,
    avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png",
    site: emp.department, // Use department as site for now
    user_id: emp.user_id
  }));

  // Fetch payroll statistics
  const { data: payrollStats } = useQuery({
    queryKey: ['payroll-stats', selectedPeriod],
    queryFn: async () => {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const { data, error } = await supabase
        .from('payroll')
        .select('base_pay, overtime_pay, deductions')
        .like('payment_date', `${currentMonth}%`);
      
      if (error) throw error;
      
      const totalPayroll = data?.reduce((sum, record) => sum + (record.base_pay || 0), 0) || 0;
      const totalOvertime = data?.reduce((sum, record) => sum + (record.overtime_pay || 0), 0) || 0;
      const totalDeductions = data?.reduce((sum, record) => sum + (record.deductions || 0), 0) || 0;
      
      return {
        monthlyPayroll: totalPayroll,
        overtime: totalOvertime,
        bonuses: totalDeductions // Using deductions as placeholder for bonuses
      };
    }
  });

  const {
    selectedEmployees,
    isProcessing,
    isExporting,
    handleSelectEmployee,
    handleSelectAll,
    handleClearAll,
    handleProcessPayroll,
    handleExportPayroll,
  } = usePayroll(employees);

  // Transform employees data for the table display
  const employeesData = employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    email: `${emp.name.toLowerCase().replace(/\s+/g, '.')}@stellia.com`,
    position: emp.title,
    salary: `$${(typeof emp.salary === 'number' ? emp.salary : parseInt(emp.salary.toString().replace(/\$|,/g, '') || '0')).toFixed(2)}`,
    status: emp.status,
    overtime: Math.random() > 0.5 ? `${Math.floor(Math.random() * 20)}hrs` : '-',
    avatar: emp.avatar
  }));

  const filteredEmployees = employeesData.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleExportCSV = async () => {
    try {
      await handleExportPayroll();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleProcessSelected = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to process payroll.",
        variant: "destructive"
      });
      return;
    }
    
    await handleProcessPayroll();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 relative">
      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="w-80 bg-gradient-to-br from-blue-500 to-cyan-400 text-white border-0 shadow-xl">
            <CardContent className="p-6 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-white hover:bg-white/20"
                onClick={() => setShowAIAssistant(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Stella AI</h3>
                  <p className="text-blue-100 text-sm">
                    Generate your financial report with ease with our AI personal assistant
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  toast({
                    title: "AI Assistant",
                    description: "AI-powered financial reporting is coming soon!",
                  });
                }}
              >
                Try now!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Settings className="h-4 w-4 mr-2" />
            Payroll Settings
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="26 Jan 2024 — 25 Feb 2024">26 Jan 2024 — 25 Feb 2024</SelectItem>
              <SelectItem value="26 Dec 2023 — 25 Jan 2024">26 Dec 2023 — 25 Jan 2024</SelectItem>
              <SelectItem value="26 Nov 2023 — 25 Dec 2023">26 Nov 2023 — 25 Dec 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="xl:col-span-1 space-y-4">
          {/* Monthly Payroll Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4" />
                Monthly Payroll
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${payrollStats?.monthlyPayroll?.toLocaleString() || '3,230,250'}
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <p className="text-sm text-gray-500">.00</p>
            </CardContent>
          </Card>

          {/* Overtime Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4" />
                Overtime
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${payrollStats?.overtime?.toLocaleString() || '220,500'}
                </span>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">-5.3%</span>
              </div>
              <p className="text-sm text-gray-500">.00</p>
            </CardContent>
          </Card>

          {/* Bonuses Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <DollarSign className="h-4 w-4" />
                Bonuses & Incentives
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${payrollStats?.bonuses?.toLocaleString() || '150,000'}
                </span>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">-12.3%</span>
              </div>
              <p className="text-sm text-gray-500">.00</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="xl:col-span-3">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={timeView === 'Day' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeView('Day')}
                    className="text-sm"
                  >
                    Day
                  </Button>
                  <Button 
                    variant={timeView === 'Week' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeView('Week')}
                    className="text-sm"
                  >
                    Week
                  </Button>
                  <Button 
                    variant={timeView === 'Month' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeView('Month')}
                    className="text-sm"
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Chart Implementation */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full p-8">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, index) => (
                    <div key={month} className="flex flex-col items-center">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-6 md:w-8 bg-blue-600 rounded-t" style={{ height: `${60 + index * 10}px` }}></div>
                        <div className="w-6 md:w-8 bg-blue-300 rounded-t" style={{ height: `${40 + index * 5}px` }}></div>
                        <div className="w-6 md:w-8 bg-purple-400 rounded-t" style={{ height: `${20 + index * 3}px` }}></div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Monthly Payroll</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Overtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Bonuses & Incentives</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              Employee
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search employees"
                  className="pl-10 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          {selectedEmployees.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedEmployees.size} employee(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleClearAll}>
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleProcessSelected}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Process Payroll'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onChange={handleSelectAll}
                      checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Salary</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Recurring</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Overtime</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          checked={selectedEmployees.has(employee.id)}
                          onChange={() => handleSelectEmployee(employee.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{employee.position}</td>
                      <td className="py-3 px-4 font-medium text-sm">{employee.salary}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">Recurring</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{employee.overtime}</td>
                      <td className="py-3 px-4">{getStatusBadge(employee.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="Settings">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollDashboard;
