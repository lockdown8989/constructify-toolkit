import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, DollarSign, TrendingUp, Users, Download, Settings, Filter, Grid, List, Search, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { usePayrollSync } from '@/hooks/use-payroll-sync';
import { PayrollStatsGrid } from '@/components/payroll/stats/PayrollStatsGrid';
import { PayrollOverviewChart } from '@/components/payroll/charts/PayrollOverviewChart';
import { formatCurrency } from '@/utils/format';

const PayrollDashboard = () => {
  const { user, isPayroll } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  
  const { 
    payrollMetrics, 
    isLoading, 
    isProcessing, 
    error, 
    manualSync,
    refetch 
  } = usePayrollSync(timeRange);
  
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

  const employees = [
    {
      id: "1",
      name: "Rhaenyra Targaryen",
      email: "rhaenyra@stellia.com",
      position: "Product Designer",
      salary: "$1,250.00",
      status: "Paid",
      overtime: "12hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "2", 
      name: "Daemon Targaryen",
      email: "daemon@stellia.com",
      position: "Finance Manager",
      salary: "$1,150.00",
      status: "Pending",
      overtime: "2hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "3",
      name: "Jon Snow",
      email: "jon@stellia.com", 
      position: "Sr Graphic Designer",
      salary: "$1,000.00",
      status: "Paid",
      overtime: "-",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "4",
      name: "Aegon Targaryen",
      email: "aegon@stellia.com",
      position: "Lead Product Designer", 
      salary: "$1,500.00",
      status: "Paid",
      overtime: "10hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "5",
      name: "Alicent Hightower",
      email: "alicent@stellia.com",
      position: "Project Manager",
      salary: "$1,325.00", 
      status: "Paid",
      overtime: "8hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    }
  ];

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

  const handleTimeRangeChange = (newRange: 'day' | 'week' | 'month') => {
    setTimeRange(newRange);
  };

  return (
    <div className="container py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Payroll</h1>
            <p className="text-gray-600">Manage employee payroll and payments</p>
            {payrollMetrics.lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last sync: {new Date(payrollMetrics.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={manualSync}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Payroll Settings
          </Button>
          <Select defaultValue="26 Jan 2024 — 25 Feb 2024">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="26 Jan 2024 — 25 Feb 2024">26 Jan 2024 — 25 Feb 2024</SelectItem>
              <SelectItem value="26 Dec 2023 — 25 Jan 2024">26 Dec 2023 — 25 Jan 2024</SelectItem>
              <SelectItem value="26 Nov 2023 — 25 Dec 2023">26 Nov 2023 — 25 Dec 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Live Stats Grid */}
          <PayrollStatsGrid
            totalPayroll={payrollMetrics.totalPayroll}
            totalEmployees={payrollMetrics.totalEmployees}
            paidEmployees={payrollMetrics.paidEmployees}
            pendingEmployees={payrollMetrics.pendingEmployees}
            absentEmployees={payrollMetrics.absentEmployees}
          />

          {/* Live Payroll Chart */}
          <PayrollOverviewChart
            data={payrollMetrics.chartData}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            isLoading={isLoading}
            onRefresh={refetch}
            lastUpdated={payrollMetrics.lastUpdated}
          />

          {/* AI Insights */}
          {payrollMetrics.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Average Salary</p>
                        <p className="text-lg font-bold">{formatCurrency(payrollMetrics.analysis.averageSalary || 0)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {payrollMetrics.analysis.insights && (
                    <div>
                      <h4 className="font-medium mb-2">Analysis</h4>
                      <p className="text-sm text-muted-foreground">{payrollMetrics.analysis.insights}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Employee Table - keeping existing structure */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee ({payrollMetrics.totalEmployees} total)
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
              {/* ... keep existing employee table code */}
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
                    {employees.map((employee) => (
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
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              👁
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... keep existing TabsContent for other tabs */}
        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Payroll processing interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Payroll reports and analytics will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Payroll calendar view will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Payroll approval workflow will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollDashboard;
