
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CostAnalytics: React.FC = () => {
  const { laborCosts, costsLoading } = useShiftPlanning();

  if (costsLoading) {
    return <div className="text-center py-8">Loading cost analytics...</div>;
  }

  // Calculate metrics
  const totalCosts = laborCosts.reduce((sum, cost) => sum + cost.total_cost, 0);
  const totalBaseCosts = laborCosts.reduce((sum, cost) => sum + cost.base_cost, 0);
  const totalOvertimeCosts = laborCosts.reduce((sum, cost) => sum + cost.overtime_cost, 0);
  const avgCostPerShift = laborCosts.length > 0 ? totalCosts / laborCosts.length : 0;
  const overtimePercentage = totalCosts > 0 ? (totalOvertimeCosts / totalCosts) * 100 : 0;

  // Prepare chart data
  const costBreakdown = [
    { name: 'Regular Hours', value: totalBaseCosts, color: '#3b82f6' },
    { name: 'Overtime', value: totalOvertimeCosts, color: '#ef4444' },
    { name: 'Break Time', value: laborCosts.reduce((sum, cost) => sum + cost.break_cost, 0), color: '#10b981' }
  ];

  // Daily cost trend (mock data for demonstration)
  const dailyCosts = [
    { day: 'Mon', cost: 1200 },
    { day: 'Tue', cost: 1350 },
    { day: 'Wed', cost: 1180 },
    { day: 'Thu', cost: 1420 },
    { day: 'Fri', cost: 1680 },
    { day: 'Sat', cost: 1950 },
    { day: 'Sun', cost: 1100 }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cost Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Labor Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Costs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOvertimeCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {overtimePercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost Per Shift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgCostPerShift.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per scheduled shift
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <p className="text-xs text-muted-foreground">
              Budget utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Cost Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                <Bar dataKey="cost" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cost Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cost Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Schedule ID</th>
                  <th className="text-left p-2">Base Cost</th>
                  <th className="text-left p-2">Overtime</th>
                  <th className="text-left p-2">Break Cost</th>
                  <th className="text-left p-2">Total Cost</th>
                  <th className="text-left p-2">Calculated</th>
                </tr>
              </thead>
              <tbody>
                {laborCosts.slice(0, 10).map((cost) => (
                  <tr key={cost.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{cost.schedule_id.slice(0, 8)}...</td>
                    <td className="p-2">${cost.base_cost.toFixed(2)}</td>
                    <td className="p-2 text-red-600">${cost.overtime_cost.toFixed(2)}</td>
                    <td className="p-2">${cost.break_cost.toFixed(2)}</td>
                    <td className="p-2 font-semibold">${cost.total_cost.toFixed(2)}</td>
                    <td className="p-2 text-gray-500">
                      {new Date(cost.calculated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalytics;
