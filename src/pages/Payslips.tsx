
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Download, FileText, Calendar, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const PayslipsPage = () => {
  const { isPayroll } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Only allow payroll users to access this page
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

  // Fetch payroll data for payslip generation
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll-data', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          *,
          employees (
            id,
            name,
            job_title,
            department
          )
        `)
        .gte('payment_date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
        .lt('payment_date', `${selectedYear}-${String(selectedMonth + 2).padStart(2, '0')}-01`);
        
      if (error) throw error;
      return data;
    }
  });

  const generatePayslip = async (payrollId: string, employeeName: string) => {
    try {
      toast({
        title: "Generating Payslip",
        description: `Creating payslip for ${employeeName}...`,
      });
      
      // In a real implementation, this would call a backend service to generate the PDF
      // For now, we'll simulate the process
      setTimeout(() => {
        toast({
          title: "Payslip Generated",
          description: `Payslip for ${employeeName} has been generated successfully.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate payslip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredPayrollData = payrollData?.filter(item => 
    item.employees?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.employees?.department?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container py-6 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Payslips Management</h1>
        </div>
        <p className="text-muted-foreground">Generate and manage employee payslips</p>
      </header>

      {/* Filters Section */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {format(new Date(0, i), 'MMMM')}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </Card>

      {/* Payslips List */}
      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payroll data...</p>
          </div>
        ) : filteredPayrollData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Payroll Data Found</h3>
            <p className="text-muted-foreground">
              No payroll data available for the selected period.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPayrollData.map((payroll) => (
                <Card key={payroll.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-lg">{payroll.employees?.name}</h4>
                      <p className="text-sm text-muted-foreground">{payroll.employees?.job_title}</p>
                      <p className="text-sm text-muted-foreground">{payroll.employees?.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">${payroll.salary_paid}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payroll.payment_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Base Pay:</span>
                      <span className="ml-1">${payroll.base_pay || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Overtime:</span>
                      <span className="ml-1">${payroll.overtime_pay || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="ml-1">${payroll.tax_paid || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net:</span>
                      <span className="ml-1 font-medium">${(payroll.salary_paid - (payroll.tax_paid || 0))}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generatePayslip(payroll.id, payroll.employees?.name || 'Employee')}
                      className="flex-1"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate Payslip
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      payroll.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : payroll.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payroll.payment_status || 'pending'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PayslipsPage;
