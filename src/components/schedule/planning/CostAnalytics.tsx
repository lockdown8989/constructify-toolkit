
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { DollarSign, TrendingUp, Clock, Users } from 'lucide-react';

const CostAnalytics: React.FC = () => {
  const { laborCosts, costsLoading } = useShiftPlanning();

  // Calculate totals
  const totalLaborCost = laborCosts.reduce((sum, cost) => sum + cost.total_cost, 0);
  const totalOvertimeCost = laborCosts.reduce((sum, cost) => sum + cost.overtime_cost, 0);
  const totalBaseCost = laborCosts.reduce((sum, cost) => sum + cost.base_cost, 0);
  const overtimePercentage = totalLaborCost > 0 ? (totalOvertimeCost / totalLaborCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cost Analytics</h2>
      </div>

      {costsLoading ? (
        <div className="text-center py-8">Loading cost analytics...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Labor Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalLaborCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all schedules
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Base Cost</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalBaseCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Regular hours cost
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overtime Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">${totalOvertimeCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {overtimePercentage.toFixed(1)}% of total cost
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(0, 100 - overtimePercentage).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost optimization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {laborCosts.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No cost data available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Labor costs will appear here once schedules are created and calculated
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {laborCosts.map((cost) => (
                    <div key={cost.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">Schedule ID: {cost.schedule_id.slice(0, 8)}...</div>
                        <div className="text-sm text-gray-500">
                          Calculated: {new Date(cost.calculated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold">${cost.total_cost.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          Base: ${cost.base_cost.toFixed(2)} | 
                          OT: ${cost.overtime_cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Optimization Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overtimePercentage > 20 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-800">High Overtime Costs</div>
                      <div className="text-sm text-orange-700">
                        Consider hiring additional staff or redistributing shifts to reduce overtime expenses.
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Schedule Optimization</div>
                    <div className="text-sm text-blue-700">
                      Use shift templates to standardize schedules and reduce planning time.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Cross-Training Benefits</div>
                    <div className="text-sm text-green-700">
                      Cross-train employees to provide more scheduling flexibility and reduce coverage gaps.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CostAnalytics;
