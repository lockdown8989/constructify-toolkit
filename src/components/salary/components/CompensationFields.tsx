
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CompensationFieldsProps {
  form: any;
  disabled?: boolean;
}

const CompensationFields: React.FC<CompensationFieldsProps> = ({ form, disabled }) => {
  return (
    <div className="grid gap-4 py-4">
      <FormField
        control={form.control}
        name="salary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Annual Salary</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter salary amount"
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hourly_rate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hourly Rate (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter hourly rate"
                type="number"
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  field.onChange(value);
                }}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="annual_leave_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Leave Days</FormLabel>
              <FormControl>
                <Input
                  placeholder="20"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value || '20'))}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sick_leave_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sick Leave Days</FormLabel>
              <FormControl>
                <Input
                  placeholder="10"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value || '10'))}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default CompensationFields;
