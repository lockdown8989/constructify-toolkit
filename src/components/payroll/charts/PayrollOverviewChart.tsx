
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { formatCurrency } from '@/utils/format';
import { Loader2, RefreshCw } from 'lucide-react';

interface PayrollOverviewChartProps {
  data: any[];
  timeRange: 'day' | 'week' | 'month';
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: string;
}

export const PayrollOverviewChart: React.FC<PayrollOverviewChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  isLoading,
  onRefresh,
  lastUpdated
}) => {
  const formatXAxisLabel = (value: string) => {
    switch (timeRange) {
      case 'day':
        return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        return `Week of ${new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
      default:
        return new Date(value + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{formatXAxisLabel(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payroll Overview</CardTitle>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={timeRange === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTimeRangeChange('day')}
              >
                Day
              </Button>
              <Button
                variant={timeRange === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTimeRangeChange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTimeRangeChange('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No data available for the selected time range</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="period" 
                  tickFormatter={formatXAxisLabel}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, 'USD')}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="totalPayroll" 
                  fill="#3b82f6" 
                  name="Monthly Payroll"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="overtime" 
                  fill="#60a5fa" 
                  name="Overtime"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="bonuses" 
                  fill="#a855f7" 
                  name="Bonuses & Incentives"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Monthly Payroll</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Overtime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Bonuses & Incentives</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
