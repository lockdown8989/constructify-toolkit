
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/components/restaurant/utils/schedule-utils';

interface CompensationFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const CompensationFields: React.FC<CompensationFieldsProps> = ({ form }) => {
  const salary = form.watch('salary') || 0;
  const netSalary = salary * 0.75;
  
  return (
    <div className="space-y-4">
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
      
      <Separator className="my-4" />
      
      <div className="bg-gray-50 p-3 rounded-md">
        <div className="flex items-center mb-2">
          <Info className="h-4 w-4 text-gray-500 mr-2" />
          <p className="text-sm font-medium text-gray-700">Compensation Breakdown</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Tax Rate:</p>
            <p className="font-medium">20%</p>
          </div>
          <div>
            <p className="text-gray-500">Insurance:</p>
            <p className="font-medium">5%</p>
          </div>
          <div>
            <p className="text-gray-500">Net Salary:</p>
            <p className="font-medium">{salary ? formatCurrency(netSalary) : '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Pay Period:</p>
            <p className="font-medium">Monthly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationFields;
