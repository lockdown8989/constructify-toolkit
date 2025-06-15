import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShiftPatterns } from '@/hooks/use-shift-patterns';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ShiftPatternFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const ShiftPatternFields: React.FC<ShiftPatternFieldsProps> = ({ form }) => {
  const { data: shiftPatterns, isLoading, error } = useShiftPatterns();

  const daysOfWeek: Array<{ key: keyof EmployeeFormValues; label: string }> = [
    { key: 'monday_shift_id', label: 'Monday' },
    { key: 'tuesday_shift_id', label: 'Tuesday' },
    { key: 'wednesday_shift_id', label: 'Wednesday' },
    { key: 'thursday_shift_id', label: 'Thursday' },
    { key: 'friday_shift_id', label: 'Friday' },
    { key: 'saturday_shift_id', label: 'Saturday' },
    { key: 'sunday_shift_id', label: 'Sunday' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Loading shift patterns...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-red-500">Error loading shift patterns. Please try again.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Default Shift Pattern */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Default Shift Pattern</h4>
          <Separator className="mb-4" />
          
          <FormField
            control={form.control}
            name="shift_pattern_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Shift Pattern</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value || '')} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a default shift pattern" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No default pattern</SelectItem>
                    {shiftPatterns?.map((pattern) => (
                      <SelectItem key={pattern.id} value={pattern.id}>
                        {pattern.name} ({pattern.start_time} - {pattern.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Daily Shift Assignments */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Shift Assignments</h4>
          <Separator className="mb-4" />
          <p className="text-xs text-gray-500 mb-4">
            Override the default shift pattern for specific days of the week.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daysOfWeek.map(({ key, label }) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value || '')} 
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Use default or select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Use default pattern</SelectItem>
                        {shiftPatterns?.map((pattern) => (
                          <SelectItem key={pattern.id} value={pattern.id}>
                            {pattern.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftPatternFields;
