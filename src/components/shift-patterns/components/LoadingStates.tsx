
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle, Loader2 } from 'lucide-react';

export const LoadingState = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Employee Shift Assignment
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ErrorState = ({ errorMessage }: { errorMessage: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Employee Shift Assignment
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading data</p>
          <p className="text-gray-500 text-sm">{errorMessage}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const EmptyEmployeesState = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Employee Shift Assignment
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No employees found</p>
        <p className="text-gray-500 text-sm">Add employees to assign shift patterns</p>
      </div>
    </CardContent>
  </Card>
);

export const EmptyShiftPatternsState = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Employee Shift Assignment
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No shift patterns found</p>
        <p className="text-gray-500 text-sm">Create shift patterns first to assign them to employees</p>
      </div>
    </CardContent>
  </Card>
);

export const EmployeeDataLoading = () => (
  <div className="flex items-center justify-center py-4">
    <Loader2 className="h-6 w-6 animate-spin mr-2" />
    <span>Loading employee data...</span>
  </div>
);
