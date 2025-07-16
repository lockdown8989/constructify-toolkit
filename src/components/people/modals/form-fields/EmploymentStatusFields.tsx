
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EmploymentStatusFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const EmploymentStatusFields: React.FC<EmploymentStatusFieldsProps> = ({ form }) => {
  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'Full-Time':
        return 'text-green-800 bg-green-100 border-green-200';
      case 'Part-Time':
        return 'text-blue-800 bg-blue-100 border-blue-200';
      case 'Agency':
        return 'text-orange-800 bg-orange-100 border-orange-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="employment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Full-Time">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getEmploymentTypeColor('Full-Time')}`}>
                        Full-Time
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Part-Time">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getEmploymentTypeColor('Part-Time')}`}>
                        Part-Time
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Agency">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getEmploymentTypeColor('Agency')}`}>
                        Agency
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="probation_end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probation End Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  placeholder="Select probation end date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="job_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Enter job description, responsibilities, and requirements..."
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="lifecycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
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
              <FormLabel>Current Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select current status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="annual_leave_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Leave Days</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="20" 
                  min="0" 
                  max="365"
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    field.onChange(isNaN(value) ? 20 : Math.max(0, Math.min(365, value)));
                  }}
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
                  type="number" 
                  placeholder="10" 
                  min="0" 
                  max="365"
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    field.onChange(isNaN(value) ? 10 : Math.max(0, Math.min(365, value)));
                  }}
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

export default EmploymentStatusFields;
