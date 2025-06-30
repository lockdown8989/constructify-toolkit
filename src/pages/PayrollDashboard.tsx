
import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePayrollSync } from '@/hooks/use-payroll-sync';
import { PayrollStatsGrid } from '@/components/payroll/stats/PayrollStatsGrid';
import { PayrollOverviewChart } from '@/components/payroll/charts/PayrollOverviewChart';
import { PayrollStatsModal } from '@/components/payroll/stats/PayrollStatsModal';
import { PayrollHeader } from '@/components/payroll/header/PayrollHeader';
import { PayrollStatsCards } from '@/components/payroll/cards/PayrollStatsCards';
import { PayrollEmployeeTable } from '@/components/payroll/table/PayrollEmployeeTable';
import { PayrollInsights } from '@/components/payroll/insights/PayrollInsights';

const PayrollDashboard = () => {
  const { user, isPayroll } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    statType: 'total' | 'employees' | 'paid' | 'pending' | 'absent';
    statValue: number | string;
  }>({
    isOpen: false,
    statType: 'total',
    statValue: 0,
  });
  
  const { 
    payrollMetrics, 
    isLoading, 
    isProcessing, 
    error, 
    manualSync,
    refetch 
  } = usePayrollSync(timeRange);

  // Fetch live overtime data for accurate display
  const { data: overtimeData } = useQuery({
    queryKey: ['overtime-hours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('overtime_minutes')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
      if (error) throw error;
      return data?.reduce((sum, record) => sum + (record.overtime_minutes || 0), 0) || 0;
    },
    refetchInterval: 30000
  });
  
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

  const actualEmployeeCount = payrollMetrics.totalEmployees;
  const overtimeHours = Math.round((overtimeData || 0) / 60);

  const handleCardClick = (statType: 'total' | 'employees' | 'paid' | 'pending' | 'absent', value: number) => {
    setModalState({
      isOpen: true,
      statType,
      statValue: value,
    });
  };

  const handleTimeRangeChange = (newRange: 'day' | 'week' | 'month') => {
    setTimeRange(newRange);
  };

  return (
    <div className="container py-6 animate-fade-in">
      <PayrollHeader
        lastUpdated={payrollMetrics.lastUpdated}
        isProcessing={isProcessing}
        onManualSync={manualSync}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PayrollStatsCards
            totalPayroll={payrollMetrics.totalPayroll}
            totalEmployees={actualEmployeeCount}
            pendingEmployees={payrollMetrics.pendingEmployees}
            overtimeHours={overtimeHours}
            onCardClick={handleCardClick}
          />

          <PayrollStatsGrid
            totalPayroll={payrollMetrics.totalPayroll}
            totalEmployees={payrollMetrics.totalEmployees}
            paidEmployees={payrollMetrics.paidEmployees}
            pendingEmployees={payrollMetrics.pendingEmployees}
            absentEmployees={payrollMetrics.absentEmployees}
          />

          <PayrollOverviewChart
            data={payrollMetrics.chartData}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            isLoading={isLoading}
            onRefresh={refetch}
            lastUpdated={payrollMetrics.lastUpdated}
          />

          <PayrollInsights analysis={payrollMetrics.analysis} />

          <PayrollEmployeeTable
            employees={employees}
            actualEmployeeCount={actualEmployeeCount}
            searchQuery={searchQuery}
            viewMode={viewMode}
            isLoading={isLoading}
            onSearchChange={setSearchQuery}
            onViewModeChange={setViewMode}
          />
        </TabsContent>

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

      <PayrollStatsModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        statType={modalState.statType}
        statValue={modalState.statValue}
      />
    </div>
  );
};

export default PayrollDashboard;
