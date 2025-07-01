import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useShiftPatterns } from '@/hooks/use-shift-patterns';

interface ShiftPatternFieldsProps {
  control: Control<any>;
}

const ShiftPatternFields: React.FC<ShiftPatternFieldsProps> = ({ control }) => {
  const { data: shiftPatterns = [] } = useShiftPatterns();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shift Pattern Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Shift pattern fields are currently disabled. Please contact your administrator to configure shift patterns.
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftPatternFields;
