
import React, { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface CompensationFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const CompensationFields: React.FC<CompensationFieldsProps> = ({ form }) => {
  const salary = form.watch('salary') || 0;
  const hourlyRate = form.watch('hourly_rate') || 0;
  const department = form.watch('department');
  
  const netSalary = salary * 0.75;
  
  // Calculate annual salary from hourly rate for information purposes
  const estimatedAnnualFromHourly = hourlyRate > 0 ? hourlyRate * 40 * 52 : 0; // 40h/week, 52 weeks
  
  // Update annual salary when hourly rate changes (if user has entered hourly rate)
  // Removed automatic setValue to prevent layout jumping during typing
  // Users can see the estimated annual in the description text
  
  // Common departments for UK and USA that typically use hourly rates
  const hourlyRateDepartments = ['Hospital', 'Healthcare', 'Waste Services', 'Council', 'Retail', 'Hospitality', 'Cleaning'];
  const showHourlyRateProminent = hourlyRateDepartments.some(dept => 
    department?.toLowerCase().includes(dept.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      {showHourlyRateProminent ? (
        <>
          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate (£ per hour)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="15.00" 
                    step="0.01"
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.valueAsNumber;
                      field.onChange(isNaN(value) ? 0 : Math.max(0, value));
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Estimated annual: {formatCurrency(estimatedAnnualFromHourly)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Salary</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="65000" 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.valueAsNumber;
                      field.onChange(isNaN(value) ? 0 : Math.max(0, value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : (
        <>
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Salary</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="65000" 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.valueAsNumber;
                      field.onChange(isNaN(value) ? 0 : Math.max(0, value));
                    }}
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
                <FormLabel>Hourly Rate (£ per hour)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="15.00"
                    step="0.01"
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.valueAsNumber;
                      field.onChange(isNaN(value) ? undefined : Math.max(0, value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      
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
            <p className="text-gray-500">Hourly Equivalent:</p>
            <p className="font-medium">{salary > 0 ? `${formatCurrency(salary / (40 * 52))}/hour` : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationFields;
