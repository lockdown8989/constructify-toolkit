
import React from 'react';
import { Card } from '@/components/ui/card';
import { useSalaryStatistics } from '@/hooks/use-salary-statistics';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';

export const SalaryOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useSalaryStatistics(user?.id);

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
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6 bg-red-50">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Error loading payslip data. Please try again later.</p>
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
              <Button variant="outline" size="sm">
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
