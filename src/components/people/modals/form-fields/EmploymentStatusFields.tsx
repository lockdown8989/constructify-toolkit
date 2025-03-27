import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues, validStatusForLifecycle } from '../employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmploymentStatusFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const EmploymentStatusFields: React.FC<EmploymentStatusFieldsProps> = ({ form }) => {
  // Define valid options for lifecycle
  const lifecycleOptions = ['Employed', 'Onboarding', 'Offboarding', 'Alumni'];
  
  // Watch lifecycle to determine valid status options
  const lifecycle = form.watch('lifecycle');
  const validStatusOptions = validStatusForLifecycle[lifecycle as keyof typeof validStatusForLifecycle] || ['Active'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="lifecycle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lifecycle Stage</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select lifecycle" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {lifecycleOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employment Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {validStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EmploymentStatusFields;
