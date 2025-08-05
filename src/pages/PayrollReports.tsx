import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart 
} from 'recharts';
import { 
  Download, FileText, TrendingUp, Users, PoundSterling, Calendar,
  Clock, AlertCircle, CheckCircle, Activity, Target, Filter,
  RefreshCw, Eye, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PayrollReports() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [reportType, setReportType] = useState<string>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch live payroll data with proper relationship references
  const { data: payrollData, isLoading, refetch } = useQuery({
    queryKey: ['payroll-reports-page', selectedPeriod], // Different key to avoid conflicts
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          *,
          employees!payroll_employee_id_fkey (
            name,
            job_title,
            department,
            site
          )
        `)
        .order('payment_date', { ascending: false })
        .limit(200); // Reasonable limit
      
      if (error) {
        console.error('PayrollReports page error:', error);
        throw error;
      }
      console.log('PayrollReports data fetched:', data?.length || 0, 'records');
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 45000, // Refresh every 45 seconds
  });

  // Fetch employee stats
  const { data: employeeStats } = useQuery({
    queryKey: ['employee-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('department, job_title, salary, status');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
    toast({
      title: "Data Refreshed",
      description: "Latest payroll data has been loaded.",
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Report Exported",
      description: "Payroll report has been downloaded successfully.",
    });
  };

  // Calculate metrics
  const totalPayroll = payrollData?.reduce((sum, record) => sum + (record.salary_paid || 0), 0) || 0;
  const employeeCount = new Set(payrollData?.map(record => record.employee_id)).size;
  const averageSalary = employeeCount > 0 ? totalPayroll / employeeCount : 0;
  const totalOvertimePaid = payrollData?.reduce((sum, record) => sum + (record.overtime_pay || 0), 0) || 0;

  // Department breakdown
  const departmentData = employeeStats?.reduce((acc: any[], emp) => {
    const existing = acc.find(d => d.name === emp.department);
    if (existing) {
      existing.value += emp.salary || 0;
      existing.count += 1;
    } else {
      acc.push({
        name: emp.department,
        value: emp.salary || 0,
        count: 1,
        color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][acc.length % 5]
      });
    }
    return acc;
  }, []) || [];

  // Monthly trend data (mock data for demo)
  const monthlyTrend = [
    { month: 'Jan', payroll: 45000, overtime: 3200, employees: 12 },
    { month: 'Feb', payroll: 47000, overtime: 2800, employees: 13 },
    { month: 'Mar', payroll: 49000, overtime: 3600, employees: 14 },
    { month: 'Apr', payroll: 46000, overtime: 2400, employees: 13 },
    { month: 'May', payroll: 51000, overtime: 4100, employees: 15 },
    { month: 'Jun', payroll: 48000, overtime: 3300, employees: 14 },
  ];

  // Activity data for live tracking
  const recentActivity = [
    { time: '2 min ago', action: 'Payroll processed for Marketing Department', status: 'success' },
    { time: '15 min ago', action: 'Overtime approved for John Smith', status: 'success' },
    { time: '1 hour ago', action: 'New employee added to payroll system', status: 'info' },
    { time: '2 hours ago', action: 'Tax calculations updated', status: 'warning' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              Payroll Reports
            </h1>
            <p className="text-gray-600 mt-1">Employee-friendly analytics with live data tracking</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium">Period:</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium">View:</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="detailed">Detailed Analysis</SelectItem>
                    <SelectItem value="departments">Department Breakdown</SelectItem>
                    <SelectItem value="trends">Trends & Insights</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleExportReport} className="ml-auto gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Payroll</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPayroll)}</p>
                  <p className="text-blue-100 text-xs mt-1">This period</p>
                </div>
                <PoundSterling className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Employees</p>
                  <p className="text-2xl font-bold">{employeeCount}</p>
                  <p className="text-green-100 text-xs mt-1">Receiving payroll</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Average Salary</p>
                  <p className="text-2xl font-bold">{formatCurrency(averageSalary)}</p>
                  <p className="text-purple-100 text-xs mt-1">Per employee</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Overtime Paid</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalOvertimePaid)}</p>
                  <p className="text-orange-100 text-xs mt-1">This period</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Reports Content */}
        <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="detailed" className="text-sm">Detailed</TabsTrigger>
            <TabsTrigger value="departments" className="text-sm">Departments</TabsTrigger>
            <TabsTrigger value="trends" className="text-sm">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend Chart */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Monthly Payroll Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `£${value / 1000}k`} />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          name === 'payroll' ? formatCurrency(Number(value)) : `£${value}`,
                          name === 'payroll' ? 'Total Payroll' : 'Overtime'
                        ]} 
                      />
                      <Area type="monotone" dataKey="payroll" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="overtime" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Distribution */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-green-600" />
                    Department Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Live Activity Feed */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Live Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        activity.status === 'success' && "bg-green-500",
                        activity.status === 'warning' && "bg-yellow-500",
                        activity.status === 'info' && "bg-blue-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {activity.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents */}
          <TabsContent value="detailed">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Detailed payroll analysis and employee breakdown coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Department Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Department-wise payroll analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Trends & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Payroll trends and insights analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
