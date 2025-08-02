import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, RefreshCw, Users, Calendar, TrendingUp } from 'lucide-react';
import { useRotaCompliance } from '@/hooks/use-rota-compliance';
import { cn } from '@/lib/utils';

const RotaComplianceDashboard: React.FC = () => {
  const { complianceReport, isLoading, runComplianceCheck } = useRotaCompliance();

  const handleManualCheck = () => {
    runComplianceCheck();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading compliance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rota Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No compliance data available</p>
            <Button onClick={handleManualCheck}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Compliance Check
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalSchedules, incompleteSchedules, complianceRate, employeesWithViolations } = complianceReport;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rota Compliance Dashboard
            </CardTitle>
            <Button onClick={handleManualCheck} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Compliance Rate */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Compliance Rate</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {complianceRate.toFixed(1)}%
              </div>
              <Progress value={complianceRate} className="h-2" />
            </div>

            {/* Total Schedules */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Total Rota Schedules</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {totalSchedules}
              </div>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </div>

            {/* Incomplete Schedules */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Incomplete</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {incompleteSchedules}
              </div>
              <div className="text-xs text-muted-foreground">
                {totalSchedules > 0 ? ((incompleteSchedules / totalSchedules) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="flex items-center gap-2 mb-4">
            {complianceRate >= 95 ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Excellent Compliance
              </Badge>
            ) : complianceRate >= 80 ? (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Good Compliance
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Needs Attention
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee Violations */}
      {employeesWithViolations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees with Violations
              <Badge variant="destructive" className="ml-2">
                {employeesWithViolations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeesWithViolations.map((employee) => (
                <div
                  key={employee.employeeId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-sm">
                        {employee.employeeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{employee.employeeName}</div>
                      <div className="text-sm text-muted-foreground">
                        Employee ID: {employee.employeeId.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {employee.violationCount} violation{employee.violationCount > 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-200 rounded-full mt-0.5">
              <AlertTriangle className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">
                About Rota Compliance
              </div>
              <div className="text-blue-700">
                Employees are marked as "incomplete" if they fail to clock in or clock out according to their assigned rota patterns. 
                This system automatically monitors compliance and notifies managers of violations.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RotaComplianceDashboard;