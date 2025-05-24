
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { AlertTriangle, CheckCircle, Clock, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ConflictResolver: React.FC = () => {
  const { scheduleConflicts, resolveConflict, conflictsLoading } = useShiftPlanning();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'overlap': return <Calendar className="h-4 w-4" />;
      case 'availability': return <Clock className="h-4 w-4" />;
      case 'overtime': return <AlertTriangle className="h-4 w-4" />;
      case 'skills': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConflictDescription = (conflict: any) => {
    switch (conflict.conflict_type) {
      case 'overlap':
        return `Schedule overlaps with another shift from ${conflict.conflict_details.overlap_start} to ${conflict.conflict_details.overlap_end}`;
      case 'availability':
        return `Employee not available during this time period`;
      case 'overtime':
        return `This shift would result in overtime hours`;
      case 'skills':
        return `Employee doesn't meet the required skills for this shift`;
      default:
        return 'Unknown conflict type';
    }
  };

  const handleResolveConflict = async (conflictId: string) => {
    try {
      await resolveConflict.mutateAsync({ conflictId });
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  if (conflictsLoading) {
    return <div className="text-center py-8">Loading conflicts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schedule Conflicts</h2>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{scheduleConflicts.length} unresolved</Badge>
        </div>
      </div>

      {scheduleConflicts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700">No Conflicts Detected!</h3>
            <p className="text-gray-600">All schedules are properly aligned with employee availability and requirements.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduleConflicts.map((conflict) => (
            <Card key={conflict.id} className="border-l-4 border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getConflictIcon(conflict.conflict_type)}
                    <span className="capitalize">{conflict.conflict_type} Conflict</span>
                    <Badge className={`${getSeverityColor(conflict.severity)} text-white`}>
                      {conflict.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(conflict.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{getConflictDescription(conflict)}</p>
                
                {/* Conflict Details */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Details:</h4>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(conflict.conflict_details, null, 2)}
                  </pre>
                </div>

                {/* Resolution Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleResolveConflict(conflict.id)}
                    disabled={resolveConflict.isPending}
                  >
                    {resolveConflict.isPending ? 'Resolving...' : 'Mark as Resolved'}
                  </Button>
                  <Button size="sm" variant="outline">
                    View Schedule
                  </Button>
                  <Button size="sm" variant="outline">
                    Suggest Fix
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConflictResolver;
