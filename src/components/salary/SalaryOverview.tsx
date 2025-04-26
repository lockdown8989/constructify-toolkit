
import React from 'react';
import { Card } from '@/components/ui/card';
import { useSalaryStatistics } from '@/hooks/use-salary-statistics';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export const SalaryOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useSalaryStatistics(user?.id);

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
        <h1 className="text-2xl font-bold">Salary Information</h1>
      </div>

      <div className="space-y-4">
        <Card className="p-6 bg-amber-50">
          <h2 className="text-2xl font-bold mb-2">Base Salary</h2>
          <div className="text-4xl font-bold mb-2">
            {formatCurrency(stats?.base_salary || 0)}
          </div>
          <div className="text-gray-600 text-lg">Monthly</div>
        </Card>

        <Card className="p-6 bg-gray-100">
          <h2 className="text-2xl font-bold mb-2">Bonus</h2>
          <div className="text-4xl font-bold mb-2">
            {formatCurrency(stats?.bonus || 0)}
          </div>
          <div className="text-gray-600 text-lg">{stats?.payment_status || 'Pending'}</div>
        </Card>

        <Card className="p-6 bg-gray-700 text-white">
          <h2 className="text-2xl font-bold mb-2">Net Salary</h2>
          <div className="text-4xl font-bold mb-2">
            {formatCurrency(stats?.net_salary || 0)}
          </div>
          <div className="text-gray-300 text-lg">
            {stats?.payment_date ? `Paid on ${new Date(stats.payment_date).toLocaleDateString()}` : 'Not paid yet'}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalaryOverview;
