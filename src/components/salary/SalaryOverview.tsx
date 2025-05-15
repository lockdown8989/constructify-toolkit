
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useSalaryStatistics } from '@/hooks/use-salary-statistics';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';

export const SalaryOverview = () => {
  const { user } = useAuth();
  const { employeeId } = useEmployeeDataManagement();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: stats, isLoading, error, isError, refetch } = useSalaryStatistics(employeeId || user?.id);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleRetry = () => {
    toast({
      title: "Retrying...",
      description: "Attempting to fetch your payslip data again."
    });
    refetch();
  };

  const handleDownloadPDF = async () => {
    if (!stats || !user) {
      toast({
        title: "Cannot generate payslip",
        description: "Missing required salary or user information",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const paymentDate = stats.payment_date ? 
        format(new Date(stats.payment_date), 'MMMM yyyy') : 
        format(new Date(), 'MMMM yyyy');
        
      const result = await generatePayslipPDF(
        employeeId || user.id,
        {
          name: user.name || 'Employee',
          title: user.job_title || 'Employee',
          department: user.department || 'General',
          salary: stats.base_salary?.toString() || '0',
          paymentDate: stats.payment_date || new Date().toISOString().split('T')[0],
          payPeriod: paymentDate,
        }
      );

      if (result.success) {
        toast({
          title: "Payslip downloaded",
          description: "Your payslip has been downloaded successfully"
        });
      } else {
        throw new Error(result.error || "Failed to generate payslip");
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container py-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">My Payslip</h1>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </Card>
      ) : isError || !stats ? (
        <Card className="p-6 bg-red-50 border border-red-100">
          <div className="flex flex-col items-center text-red-700 text-center py-4">
            <AlertCircle className="h-8 w-8 mb-2" />
            <h2 className="font-semibold text-lg mb-2">Error loading payslip data</h2>
            <p className="text-sm mb-4">
              {error instanceof Error ? error.message : "Please try again later"}
            </p>
            <Button variant="outline" className="bg-white" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main Salary Information */}
          <Card className="p-6 bg-white border-t-4 border-black">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Current Pay Period</h2>
                <p className="text-sm text-gray-500">
                  {stats?.payment_date ? 
                    format(new Date(stats.payment_date), 'MMMM yyyy') : 
                    format(new Date(), 'MMMM yyyy')}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Gross Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.base_salary || 0)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Net Salary</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.net_salary || 0)}
                </p>
              </div>
            </div>
          </Card>

          {/* Deductions Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Deductions</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Tax (20%)</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency((stats?.base_salary || 0) * 0.2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Insurance (5%)</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency((stats?.base_salary || 0) * 0.05)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Total Deductions</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(stats?.deductions || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Additional Earnings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Earnings</h3>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Bonus</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(stats?.bonus || 0)}
              </span>
            </div>
          </Card>

          {/* Payment Status */}
          <Card className={`p-6 ${
            stats?.payment_status === 'Paid' ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Payment Status</h3>
                <p className={`text-sm ${
                  stats?.payment_status === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {stats?.payment_status || 'Pending'}
                </p>
              </div>
              {stats?.payment_status === 'Paid' && stats?.payment_date && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Paid on</p>
                  <p className="font-medium">
                    {format(new Date(stats.payment_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SalaryOverview;
