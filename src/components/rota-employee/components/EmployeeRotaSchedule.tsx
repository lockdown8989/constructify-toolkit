import React from 'react';
import { useEmployeeRotaLogic } from '../hooks/useEmployeeRotaLogic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';

const EmployeeRotaSchedule = () => {
  const {
    selectedDate,
    isDateDialogOpen,
    setIsDateDialogOpen,
    currentView,
    handleViewChange,
    finalEmployees,
    isLoading,
    error,
    isMobile,
    handleDateClick,
  } = useEmployeeRotaLogic();

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading employee rota schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <h3 className="text-lg font-semibold mb-2">Error Loading Employee Rota Schedule</h3>
            <p>There was an error loading the employee rota schedule. Please try refreshing the page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employee Rota Schedule
          </CardTitle>
          <p className="text-sm text-gray-600">
            View and manage employee schedules based on their assigned rota patterns
          </p>
        </CardHeader>
        <CardContent>
          {finalEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">
                No employees are available to display rota schedules.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {finalEmployees.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{employee.name}</h4>
                      <p className="text-sm text-gray-600">{employee.job_title} - {employee.department}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {/* Future: Show assigned rota patterns */}
                      No active rota patterns
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeRotaSchedule;