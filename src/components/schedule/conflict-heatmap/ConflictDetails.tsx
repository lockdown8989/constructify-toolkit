
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users, Settings } from 'lucide-react';
import { useConflictHeatmap } from '@/hooks/use-conflict-heatmap';
import { ConflictViolation } from '@/types/conflict-heatmap';

const ConflictDetails: React.FC = () => {
  const { heatmapData, isEnabled } = useConflictHeatmap();

  if (!isEnabled || !heatmapData) return null;

  const getConflictStats = () => {
    const stats = {
      totalConflicts: 0,
      hardConflicts: 0,
      softConflicts: 0,
      employeesAffected: new Set<string>(),
      violationTypes: {} as Record<string, number>
    };

    Object.entries(heatmapData.buckets).forEach(([employeeId, buckets]) => {
      Object.values(buckets).forEach(bucket => {
        if (bucket.score > 0) {
          stats.totalConflicts++;
          stats.employeesAffected.add(employeeId);
          
          bucket.violations.forEach(violation => {
            if (violation.type === 'hard') {
              stats.hardConflicts++;
            } else {
              stats.softConflicts++;
            }
            
            stats.violationTypes[violation.rule] = (stats.violationTypes[violation.rule] || 0) + 1;
          });
        }
      });
    });

    return {
      ...stats,
      employeesAffected: stats.employeesAffected.size
    };
  };

  const stats = getConflictStats();

  const getViolationIcon = (rule: string) => {
    switch (rule) {
      case 'double_booking':
        return <Users className="h-4 w-4" />;
      case 'min_rest_hours':
      case 'overtime_risk':
        return <Clock className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getViolationLabel = (rule: string) => {
    const labels: Record<string, string> = {
      'double_booking': 'Double Booking',
      'min_rest_hours': 'Insufficient Rest',
      'max_weekly_hours': 'Weekly Hours Limit',
      'overtime_risk': 'Overtime Risk',
      'skill_mismatch': 'Skill Mismatch',
      'preference_mismatch': 'Preference Conflict'
    };
    return labels[rule] || rule;
  };

  if (stats.totalConflicts === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center text-green-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No Conflicts Detected</p>
            <p className="text-sm text-muted-foreground">All schedules are properly organized</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Conflict Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.totalConflicts}</div>
            <div className="text-sm text-muted-foreground">Total Conflicts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.hardConflicts}</div>
            <div className="text-sm text-muted-foreground">Hard Conflicts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.softConflicts}</div>
            <div className="text-sm text-muted-foreground">Soft Conflicts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.employeesAffected}</div>
            <div className="text-sm text-muted-foreground">Employees Affected</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Conflict Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(stats.violationTypes).map(([rule, count]) => (
              <div key={rule} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  {getViolationIcon(rule)}
                  <span className="text-sm">{getViolationLabel(rule)}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConflictDetails;
