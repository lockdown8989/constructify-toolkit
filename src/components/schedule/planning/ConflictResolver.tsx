
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { AlertTriangle, CheckCircle, Clock, User, Calendar } from 'lucide-react';

const ConflictResolver: React.FC = () => {
  const { scheduleConflicts, resolveConflict, conflictsLoading } = useShiftPlanning();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleResolveConflict = async (conflictId: string) => {
    try {
      await resolveConflict.mutateAsync({ conflictId });
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  const formatConflictType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule Conflicts</h2>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">
            {scheduleConflicts.length} Active Conflicts
          </Badge>
        </div>
      </div>

      {conflictsLoading ? (
        <div className="text-center py-8">Loading conflicts...</div>
      ) : scheduleConflicts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">No Conflicts Detected!</h3>
            <p className="text-gray-500">All schedules are properly organized with no conflicts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduleConflicts.map((conflict) => (
            <Card key={conflict.id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(conflict.severity)}>
                      {getSeverityIcon(conflict.severity)}
                      <span className="ml-1">{conflict.severity.toUpperCase()}</span>
                    </Badge>
                    <CardTitle className="text-lg">
                      {formatConflictType(conflict.conflict_type)} Conflict
                    </CardTitle>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleResolveConflict(conflict.id)}
                    disabled={resolveConflict.isPending}
                  >
                    Resolve
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Conflict Details:</p>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {typeof conflict.conflict_details === 'object' ? (
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(conflict.conflict_details, null, 2)}
                        </pre>
                      ) : (
                        conflict.conflict_details
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Detected: {new Date(conflict.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(conflict.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {conflict.conflict_type}
                  </Badge>
                </div>

                {/* Action buttons for specific conflict types */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline">
                    View Schedule
                  </Button>
                  <Button size="sm" variant="outline">
                    Suggest Fix
                  </Button>
                  {conflict.severity === 'critical' && (
                    <Button size="sm" variant="destructive">
                      Auto-Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conflict Summary */}
      {scheduleConflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conflict Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['critical', 'high', 'medium', 'low'].map((severity) => {
                const count = scheduleConflicts.filter(c => c.severity === severity).length;
                return (
                  <div key={severity} className="text-center">
                    <div className={`text-2xl font-bold ${
                      severity === 'critical' ? 'text-red-600' :
                      severity === 'high' ? 'text-orange-600' :
                      severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{severity}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConflictResolver;
