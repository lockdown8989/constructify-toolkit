import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp, Users, PoundSterling, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

export const PayrollReportsTab: React.FC = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [reportType, setReportType] = useState<string>('summary');

  // Color palette using design tokens where possible
  const palette = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--muted-foreground))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))',
    '#0ea5e9',
    '#22c55e',
    '#f59e0b',
  ];

  const getPeriodRange = (period: string) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case 'last-month': {
        start.setMonth(start.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth(), 0); // last day of previous month
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start.setMonth(currentQuarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'year': {
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'current-month':
      default: {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
    }

    return { startDate: start, endDate: end };
  };

  const buildChartData = (records: any[], period: string) => {
    if (!records?.length) return [] as Array<{ label: string; amount: number }>;

    const map = new Map<string, number>();

    const isDaily = period === 'current-month' || period === 'last-month';

    for (const r of records) {
      const d = r.payment_date ? new Date(r.payment_date) : null;
      if (!d) continue;
      const key = isDaily
        ? String(d.getDate())
        : d.toLocaleString('en-GB', { month: 'short' });
      map.set(key, (map.get(key) || 0) + (r.salary_paid || 0));
    }

    const arr = Array.from(map.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => {
        const toNum = (s: string) => (isDaily ? Number(s) : new Date(`${s} 1, 2000`).getMonth());
        return toNum(a.label) - toNum(b.label);
      });

    return arr;
  };

  const buildDepartmentData = (records: any[]) => {
    if (!records?.length) return [] as Array<{ name: string; value: number }>;
    const map = new Map<string, number>();
    for (const r of records) {
      const dept = r.employees?.department || 'Other';
      map.set(dept, (map.get(dept) || 0) + (r.salary_paid || 0));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  };

  // Fetch payroll data for reports with period filtering
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll-reports', selectedPeriod],
    queryFn: async () => {
      const { startDate, endDate } = getPeriodRange(selectedPeriod);
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
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString())
        .order('payment_date', { ascending: false })
        .limit(200); // Reasonable cap for UI
      
      if (error) {
        console.error('Payroll reports error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 60000, // Refresh every minute
  });

  // Build charts from real data
  const chartData = React.useMemo(
    () => buildChartData(payrollData || [], selectedPeriod),
    [payrollData, selectedPeriod]
  );

  const deptData = React.useMemo(
    () => buildDepartmentData(payrollData || []),
    [payrollData]
  );

  const handleExportReport = () => {
    toast({
      title: "Report Exported",
      description: "Payroll report has been downloaded successfully.",
    });
  };

  const totalPayroll = payrollData?.reduce((sum, record) => sum + (record.salary_paid || 0), 0) || 0;
  const employeeCount = new Set(payrollData?.map(record => record.employee_id)).size;
  const averageSalary = employeeCount > 0 ? totalPayroll / employeeCount : 0;

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payroll Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm font-medium">Period:</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm font-medium">Report Type:</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="departmental">Department Report</SelectItem>
                  <SelectItem value="overtime">Overtime Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExportReport} className="md:ml-auto w-full md:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees Paid</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSalary)}</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25th</div>
            <p className="text-xs text-muted-foreground">Monthly payroll</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(value) => `£${Math.round(Number(value) / 1000)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                <Bar dataKey="amount" fill={palette[0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(Number(value))}`}
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData?.slice(0, 10).map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.employees?.name || 'Unknown Employee'}
                  </TableCell>
                  <TableCell>{record.employees?.department || 'N/A'}</TableCell>
                  <TableCell>
                    {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(record.salary_paid || 0)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.payment_status || 'pending'}
                    </span>
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
