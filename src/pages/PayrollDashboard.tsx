
import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DollarSign, TrendingUp, TrendingDown, Users, Download, Settings, Filter, Grid, List, Search, Calendar, Clock, Eye, FileText, Wallet, Plus } from 'lucide-react';
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
    title: emp.job_title,
    salary: emp.salary || 0,
    status: Math.random() > 0.2 ? 'Paid' : 'Pending' as 'Paid' | 'Absent' | 'Pending',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    department: emp.department,
    avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png",
    site: emp.department,
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
        bonuses: totalDeductions
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
    avatar: emp.avatar,
    recurring: Math.random() > 0.3 ? 'Recurring' : 'One-time'
  }));

  const filteredEmployees = employeesData.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">Processing</Badge>;
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

  const handleGeneratePayslip = (employee: any) => {
    toast({
      title: "Payslip Generated",
      description: `Payslip for ${employee.name} has been generated successfully.`,
    });
  };

  // Chart data for the line chart
  const chartData = [
    { month: 'Jan', payroll: 2800000, overtime: 180000, bonuses: 120000 },
    { month: 'Feb', payroll: 2950000, overtime: 200000, bonuses: 110000 },
    { month: 'Mar', payroll: 3100000, overtime: 190000, bonuses: 130000 },
    { month: 'Apr', payroll: 3200000, overtime: 210000, bonuses: 140000 },
    { month: 'May', payroll: 3150000, overtime: 195000, bonuses: 135000 },
    { month: 'Jun', payroll: 3300000, overtime: 220000, bonuses: 150000 },
    { month: 'Jul', payroll: 3250000, overtime: 205000, bonuses: 145000 },
    { month: 'Aug', payroll: 3400000, overtime: 230000, bonuses: 160000 },
    { month: 'Sep', payroll: 3230250, overtime: 220500, bonuses: 150000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payroll</h1>
            <p className="text-sm text-gray-500">Manage employee payments and payroll data</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto border-gray-200 hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-2" />
            Payroll Settings
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-56 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="26 Jan 2024 — 25 Feb 2024">26 Jan 2024 — 25 Feb 2024</SelectItem>
              <SelectItem value="26 Dec 2023 — 25 Jan 2024">26 Dec 2023 — 25 Jan 2024</SelectItem>
              <SelectItem value="26 Nov 2023 — 25 Dec 2023">26 Nov 2023 — 25 Dec 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-sm"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="xl:col-span-1 space-y-4">
          {/* Monthly Payroll Card */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">+12.5%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payrollStats?.monthlyPayroll?.toLocaleString() || '3,230,250'}
                </p>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            </CardContent>
          </Card>

          {/* Overtime Card */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">-5.3%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Overtime</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payrollStats?.overtime?.toLocaleString() || '220,500'}
                </p>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            </CardContent>
          </Card>

          {/* Bonuses Card */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Plus className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">-12.3%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Bonuses & Incentives</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payrollStats?.bonuses?.toLocaleString() || '150,000'}
                </p>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="xl:col-span-3">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Payroll Overview</CardTitle>
                    <p className="text-sm text-gray-500">Track payroll trends and patterns</p>
                  </div>
                </div>
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
              <div className="h-80 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-6 relative overflow-hidden">
                {/* Simplified Line Chart */}
                <svg className="w-full h-full" viewBox="0 0 800 300">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="89" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 89 0 L 0 0 0 60" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Chart lines */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="50,200 140,180 230,160 320,140 410,150 500,120 590,130 680,100 770,110"
                  />
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="50,220 140,210 230,200 320,190 410,195 500,180 590,185 680,170 770,175"
                  />
                  <polyline
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="50,240 140,235 230,230 320,225 410,230 500,220 590,225 680,215 770,220"
                  />
                  
                  {/* Data points */}
                  {chartData.map((_, index) => (
                    <circle key={index} cx={50 + index * 89} cy={200 - index * 10} r="4" fill="#3b82f6" className="hover:r-6 transition-all cursor-pointer" />
                  ))}
                </svg>
                
                {/* Month labels */}
                <div className="absolute bottom-2 left-6 right-6 flex justify-between text-xs text-gray-500">
                  {chartData.map(item => (
                    <span key={item.month}>{item.month}</span>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Monthly Payroll</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Overtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Bonuses & Incentives</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Employee Payroll</CardTitle>
                <p className="text-sm text-gray-500">{filteredEmployees.length} employees</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search employees..."
                  className="pl-10 w-full sm:w-64 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="text-xs"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="text-xs"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Bulk Actions */}
          {selectedEmployees.size > 0 && (
            <div className="m-6 mb-0 p-4 bg-blue-50 rounded-xl flex items-center justify-between border border-blue-200">
              <span className="text-sm text-blue-800 font-medium">
                {selectedEmployees.size} employee(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleClearAll} className="border-blue-200 text-blue-700">
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleProcessSelected}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? 'Processing...' : 'Process Payroll'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onChange={handleSelectAll}
                      checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Employee</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Position</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Salary</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Type</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Overtime</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading employees...</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          checked={selectedEmployees.has(employee.id)}
                          onChange={() => handleSelectEmployee(employee.id)}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700 text-sm">{employee.position}</td>
                      <td className="py-4 px-6 font-medium text-sm text-gray-900">{employee.salary}</td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{employee.recurring}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">{employee.overtime}</td>
                      <td className="py-4 px-6">{getStatusBadge(employee.status)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Generate Payslip"
                            onClick={() => handleGeneratePayslip(employee)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Settings" className="hover:bg-gray-100">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View Details" className="hover:bg-gray-100">
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
