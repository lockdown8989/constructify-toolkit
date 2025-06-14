
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShiftPatterns } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';

const ShiftPatternQuickAccess = () => {
  const navigate = useNavigate();
  const { data: shiftPatterns = [] } = useShiftPatterns();
  const { data: employees = [] } = useEmployees();

  const assignedEmployees = employees.filter(emp => emp.shift_pattern_id).length;
  const unassignedEmployees = employees.length - assignedEmployees;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Shift Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">{shiftPatterns.length}</div>
            <div className="text-gray-500">Patterns Created</div>
          </div>
          <div>
            <div className="font-medium">{assignedEmployees}</div>
            <div className="text-gray-500">Employees Assigned</div>
          </div>
        </div>
        
        {unassignedEmployees > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              <strong>{unassignedEmployees}</strong> employees need shift pattern assignment
            </div>
          </div>
        )}

        <Button 
          onClick={() => navigate('/shift-patterns')} 
          className="w-full"
          variant="outline"
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Shift Patterns
        </Button>
      </CardContent>
    </Card>
  );
};

export default ShiftPatternQuickAccess;
