
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarCheck, Users, Clock } from 'lucide-react';
import { ShiftPattern } from '@/types/shift-patterns';

interface Employee {
  id: string;
  name: string;
}

interface RotaCalendarSyncProps {
  shiftPatterns: ShiftPattern[];
  patternEmployees: Record<string, Employee[]>;
  onSyncAll: () => Promise<void>;
}

export const RotaCalendarSync: React.FC<RotaCalendarSyncProps> = ({
  shiftPatterns,
  patternEmployees,
  onSyncAll
}) => {
  const totalPatterns = shiftPatterns.length;
  const patternsWithEmployees = shiftPatterns.filter(
    pattern => patternEmployees[pattern.id]?.length > 0
  ).length;
  
  // Calculate unique employees across all patterns - improved logic
  const uniqueEmployeeIds = new Set<string>();
  
  console.log('RotaCalendarSync - patternEmployees:', patternEmployees);
  
  // Iterate through all patterns and collect unique employee IDs
  Object.values(patternEmployees).forEach(employees => {
    if (Array.isArray(employees)) {
      employees.forEach(emp => {
        if (emp && emp.id) {
          uniqueEmployeeIds.add(emp.id);
        }
      });
    }
  });
  
  const totalEmployees = uniqueEmployeeIds.size;
  
  console.log('RotaCalendarSync - Calculated totals:', {
    totalPatterns,
    patternsWithEmployees,
    totalEmployees,
    uniqueEmployeeIds: Array.from(uniqueEmployeeIds)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rota Calendar Synchronization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Rotas</p>
              <p className="text-2xl font-bold text-blue-600">{totalPatterns}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CalendarCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Ready to Sync</p>
              <p className="text-2xl font-bold text-green-600">{patternsWithEmployees}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-purple-600">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Sync all rota patterns to employee calendars for the next 12 weeks
          </p>
          <Button 
            onClick={onSyncAll}
            disabled={patternsWithEmployees === 0}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <CalendarCheck className="h-5 w-5 mr-2" />
            Sync All Rotas to Calendars
          </Button>
        </div>

        {patternsWithEmployees === 0 && totalPatterns > 0 && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800">
              No rotas are ready for synchronization. Please assign employees to your rota patterns first.
            </p>
          </div>
        )}
        
        {totalEmployees === 0 && totalPatterns > 0 && (
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-orange-800">
              No employees have been assigned to any rota patterns yet. Add employees to your rotas to enable synchronization.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
