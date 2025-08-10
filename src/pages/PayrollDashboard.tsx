
import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePayrollSync } from '@/hooks/use-payroll-sync';
import { useAttendanceReporting } from '@/hooks/use-attendance-reporting';
import { PayrollOverviewChart } from '@/components/payroll/charts/PayrollOverviewChart';
import { PayrollStatsModal } from '@/components/payroll/stats/PayrollStatsModal';
import { PayrollHeader } from '@/components/payroll/header/PayrollHeader';
import { PayrollStatsCards } from '@/components/payroll/cards/PayrollStatsCards';
import { PayrollEmployeeTable } from '@/components/payroll/table/PayrollEmployeeTable';
import { PayrollInsights } from '@/components/payroll/insights/PayrollInsights';
import { PayrollProcessingTab } from '@/components/payroll/tabs/PayrollProcessingTab';
import { PayrollReportsTab } from '@/components/payroll/tabs/PayrollReportsTab';
import { PayrollCalendarTab } from '@/components/payroll/tabs/PayrollCalendarTab';
import { PayrollApprovalsTab } from '@/components/payroll/tabs/PayrollApprovalsTab';
import { formatCurrency } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

const PayrollDashboard = () => {
  const { user, isPayroll } = useAuth();
  const isMobile = useIsMobile();
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

  // Use dedicated attendance reporting hook for accurate data
  const { data: attendanceReport, isLoading: attendanceLoading } = useAttendanceReporting(timeRange);

  // Direct employee data query with better filtering
  const { data: employeeDataDirect, isLoading: employeeLoading } = useQuery({
    queryKey: ['employees-for-payroll'],
    queryFn: async () => {
      console.log('Fetching employees directly for payroll dashboard...');
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .neq('status', 'Deleted')
        .order('name');
      
      if (error) {
        console.error('Error fetching employees directly:', error);
        throw error;
      }
      
      console.log('Direct employee data fetched:', data);
      return data || [];
    },
    refetchInterval: 15000,
    staleTime: 0,
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

  // Use direct employee data for accurate count
  const actualEmployeeCount = employeeDataDirect?.length || 0;
  const overtimeHours = Math.round((attendanceReport?.overtimeMinutes || 0) / 60);
  const presentEmployees = attendanceReport?.presentCount || 0;
  const absentEmployees = attendanceReport?.absentCount || 0;

  // Convert employee data to the format expected by the table with GBP formatting
  const employees = employeeDataDirect?.map(emp => ({
    id: emp.id,
    name: emp.name || 'Unknown',
    email: emp.email || `${emp.name?.toLowerCase().replace(' ', '.')}@company.com`,
    position: emp.job_title || 'Employee',
    salary: formatCurrency(emp.salary || 0), // This will now use GBP by default
    status: Math.random() > 0.5 ? 'Paid' : 'Pending',
    overtime: Math.random() > 0.7 ? `${Math.floor(Math.random() * 20)}hrs` : '-',
    avatar: emp.avatar || "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
  })) || [];

  console.log('PayrollDashboard render - Employee counts:', {
    payrollMetricsTotal: payrollMetrics.totalEmployees,
    actualEmployeeCount,
    employeeDataDirectLength: employeeDataDirect?.length,
    employeeLoading
  });

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
    <div className={cn(
      "animate-fade-in pb-safe-area-inset-bottom",
      isMobile ? "px-4 py-4" : "container py-6"
    )}>
      <PayrollHeader
        lastUpdated={payrollMetrics.lastUpdated}
        isProcessing={isProcessing}
        onManualSync={manualSync}
      />

      <Tabs defaultValue="overview" className={cn("space-y-6", isMobile && "space-y-4")}>
        <TabsList className={cn(
          "grid w-full",
          isMobile 
            ? "grid-cols-3 gap-1 h-auto p-1" 
            : "grid-cols-5"
        )}>
          <TabsTrigger 
            value="overview" 
            className={cn(
              isMobile && "text-xs px-2 py-3 touch-target"
            )}
          >
            {isMobile ? "Home" : "Overview"}
          </TabsTrigger>
          <TabsTrigger 
            value="processing"
            className={cn(
              isMobile && "text-xs px-2 py-3 touch-target"
            )}
          >
            {isMobile ? "Process" : "Processing"}
          </TabsTrigger>
          <TabsTrigger 
            value="reports"
            className={cn(
              isMobile && "text-xs px-2 py-3 touch-target"
            )}
          >
            Reports
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className={cn("space-y-6", isMobile && "space-y-4")}>
          <div className={cn(isMobile && "mobile-scroll-container")}>
            <PayrollStatsCards
              totalEmployees={actualEmployeeCount}
              pendingEmployees={payrollMetrics.pendingEmployees}
              presentEmployees={presentEmployees}
              absentEmployees={absentEmployees}
              overtimeHours={overtimeHours}
              onCardClick={handleCardClick}
            />

            <div className={cn(isMobile && "mt-4")}>
              <PayrollOverviewChart
                data={payrollMetrics.chartData}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
                isLoading={isLoading}
                onRefresh={refetch}
                lastUpdated={payrollMetrics.lastUpdated}
              />
            </div>

            <div className={cn(isMobile && "mt-4")}>
              <PayrollInsights analysis={payrollMetrics.analysis} />
            </div>

            <div className={cn(isMobile && "mt-4")}>
              <PayrollEmployeeTable
                employees={employees}
                actualEmployeeCount={actualEmployeeCount}
                searchQuery={searchQuery}
                viewMode={viewMode}
                isLoading={isLoading || employeeLoading || attendanceLoading}
                onSearchChange={setSearchQuery}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="processing">
          <PayrollProcessingTab employees={employees} />
        </TabsContent>

        <TabsContent value="reports">
          <PayrollReportsTab />
        </TabsContent>

        <TabsContent value="calendar">
          <PayrollCalendarTab />
        </TabsContent>

        <TabsContent value="approvals">
          <PayrollApprovalsTab />
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
