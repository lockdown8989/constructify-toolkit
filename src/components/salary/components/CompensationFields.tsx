
import React, { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { EmployeeFormValues } from '@/components/people/modals/employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { calculateUKIncomeTax } from '@/hooks/payroll/use-salary-calculation';

interface CompensationFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const CompensationFields: React.FC<CompensationFieldsProps> = ({ form }) => {
  const salary = form.watch('salary') || 0;
  const hourlyRate = form.watch('hourly_rate') || 0;
  const department = form.watch('department');
  
  // Calculate net salary with UK tax bands
  const annualSalary = salary * 12; // Convert to annual for tax calculation
  const annualTax = calculateUKIncomeTax(annualSalary);
  const effectiveTaxRate = annualSalary > 0 ? (annualTax / annualSalary) * 100 : 0;
  
  const niContribution = salary * 0.05; // 5% for NI
  const otherDeductions = salary * 0.08; // 8% other deductions
  const totalDeductions = (annualTax / 12) + niContribution + otherDeductions;
  const netSalary = salary - totalDeductions;
  
  // Calculate annual salary from hourly rate for information purposes
  const estimatedAnnualFromHourly = hourlyRate > 0 ? hourlyRate * 40 * 52 : 0; // 40h/week, 52 weeks
  
  // Update annual salary when hourly rate changes (if user has entered hourly rate)
  useEffect(() => {
    if (hourlyRate > 0 && form.getValues('salary') === 0) {
      form.setValue('salary', estimatedAnnualFromHourly);
    }
  }, [hourlyRate, form]);
  
  // Common departments for UK and USA that typically use hourly rates
  const hourlyRateDepartments = ['Hospital', 'Healthcare', 'Waste Services', 'Council', 'Retail', 'Hospitality', 'Cleaning'];
  const showHourlyRateProminent = hourlyRateDepartments.some(dept => 
    department?.toLowerCase().includes(dept.toLowerCase())
  );
  
  // Determine tax band
  const getTaxBand = (annual: number): string => {
    if (annual <= 12570) return 'Personal Allowance (0%)';
    if (annual <= 50270) return 'Basic Rate (20%)';
    if (annual <= 125140) return 'Higher Rate (40%)';
    return 'Additional Rate (45%)';
  };
  
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
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
          <p className="text-sm font-medium text-gray-700">UK Tax Breakdown</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Tax Band:</p>
            <p className="font-medium">{getTaxBand(annualSalary)}</p>
          </div>
          <div>
            <p className="text-gray-500">Effective Tax Rate:</p>
            <p className="font-medium">{effectiveTaxRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-500">Monthly Net Salary:</p>
            <p className="font-medium">{salary ? formatCurrency(netSalary) : '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Hourly Equivalent:</p>
            <p className="font-medium">{salary > 0 ? `${formatCurrency(netSalary / (40 * 4))}/hour` : '-'}</p>
          </div>
        </div>
      </div>
      
      {salary > 0 && (
        <div className="bg-blue-50 p-3 rounded-md mt-2">
          <p className="text-xs text-blue-700 font-medium mb-1">UK Tax Bands (2024/2025)</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Personal Allowance (0%):</span>
              <span>Up to £12,570</span>
            </div>
            <div className="flex justify-between">
              <span>Basic Rate (20%):</span>
              <span>£12,571 to £50,270</span>
            </div>
            <div className="flex justify-between">
              <span>Higher Rate (40%):</span>
              <span>£50,271 to £125,140</span>
            </div>
            <div className="flex justify-between">
              <span>Additional Rate (45%):</span>
              <span>Over £125,140</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompensationFields;
