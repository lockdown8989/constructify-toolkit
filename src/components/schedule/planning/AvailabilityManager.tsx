
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { useEmployees } from '@/hooks/use-employees';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

const AvailabilityManager: React.FC = () => {
  const { availabilityPatterns, availabilityLoading } = useShiftPlanning();
  const { data: employees = [] } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Create employee lookup
  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp.name;
    return acc;
  }, {} as Record<string, string>);

  // Filter patterns by selected employee
  const filteredPatterns = selectedEmployee 
    ? availabilityPatterns.filter(p => p.employee_id === selectedEmployee)
    : availabilityPatterns;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Employee Availability</h2>
        <div className="flex gap-2">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {availabilityLoading ? (
        <div className="text-center py-8">Loading availability patterns...</div>
      ) : filteredPatterns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No availability patterns found</p>
            {selectedEmployee && (
              <p className="text-sm text-gray-400 mt-2">
                Selected employee has no availability patterns set
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Availability Patterns */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Availability Patterns</h3>
            {filteredPatterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {employeeMap[pattern.employee_id] || 'Unknown Employee'}
                      </span>
                    </div>
                    <Badge variant={pattern.is_available ? "default" : "destructive"}>
                      {pattern.is_available ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {pattern.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{dayLabels[pattern.day_of_week]}</span>
                  </div>
                  
                  {pattern.is_available && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{pattern.start_time} - {pattern.end_time}</span>
                    </div>
                  )}

                  {pattern.max_hours && (
                    <div className="text-sm text-gray-600">
                      Max hours: {pattern.max_hours}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Effective from: {new Date(pattern.effective_from).toLocaleDateString()}
                    {pattern.effective_until && (
                      <> until {new Date(pattern.effective_until).toLocaleDateString()}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weekly Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Weekly Overview</h3>
            {selectedEmployee ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {employeeMap[selectedEmployee]}'s Weekly Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dayLabels.map((day, index) => {
                      const dayPattern = filteredPatterns.find(p => p.day_of_week === index);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{day}</span>
                          {dayPattern ? (
                            <div className="flex items-center gap-2">
                              {dayPattern.is_available ? (
                                <>
                                  <Badge variant="default" className="text-xs">
                                    {dayPattern.start_time} - {dayPattern.end_time}
                                  </Badge>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </>
                              ) : (
                                <>
                                  <Badge variant="destructive" className="text-xs">
                                    Unavailable
                                  </Badge>
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No pattern set</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Select an employee to view their weekly availability</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;
