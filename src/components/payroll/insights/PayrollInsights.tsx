
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface PayrollInsightsProps {
  analysis?: {
    averageSalary?: number;
    insights?: string;
  };
}

export const PayrollInsights: React.FC<PayrollInsightsProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
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
                <p className="text-lg font-bold">{formatCurrency(analysis.averageSalary || 0)}</p>
              </div>
            </div>
          </div>
          
          {analysis.insights && (
            <div>
              <h4 className="font-medium mb-2">Analysis</h4>
              <p className="text-sm text-muted-foreground">{analysis.insights}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
