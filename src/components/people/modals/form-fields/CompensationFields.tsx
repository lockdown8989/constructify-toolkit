
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CompensationFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const CompensationFields: React.FC<CompensationFieldsProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="salary"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Annual Salary (USD)</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              placeholder="65000" 
              {...field} 
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompensationFields;
