
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface WeeklyAvailabilityFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

const WeeklyAvailabilityFields: React.FC<WeeklyAvailabilityFieldsProps> = ({ form }) => {
  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Weekly Availability</h2>
            <p className="text-gray-600">
              Set your regular weekly availability. This helps managers schedule shifts and you'll receive 🔔 notifications 10 minutes before your shifts start and end.
            </p>
          </div>
          <Separator className="mb-6" />
          
          <div className="space-y-6">
            {daysOfWeek.map(({ key, label }) => (
              <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{label}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Available</span>
                    <FormField
                      control={form.control}
                      name={`${key}_available` as keyof EmployeeFormValues}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <span className={`w-3 h-3 rounded-full transition-colors ${field.value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <Switch 
                                checked={!!field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  // If turning off availability, clear the time fields
                                  if (!checked) {
                                    form.setValue(`${key}_start_time` as keyof EmployeeFormValues, '09:00');
                                    form.setValue(`${key}_end_time` as keyof EmployeeFormValues, '17:00');
                                  }
                                }}
                                className={field.value ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name={`${key}_available` as keyof EmployeeFormValues}
                  render={({ field }) => (
                    <div className={`grid grid-cols-2 gap-6 transition-all duration-300 ${field.value ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <FormField
                        control={form.control}
                        name={`${key}_start_time` as keyof EmployeeFormValues}
                        render={({ field: timeField }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-500 mb-2 block">From</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 text-gray-400">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12,6 12,12 16,14"/>
                                  </svg>
                                </div>
                                <Input 
                                  type="time" 
                                  value={timeField.value as string || '09:00'}
                                  onChange={timeField.onChange}
                                  className="flex-1"
                                  disabled={!field.value}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`${key}_end_time` as keyof EmployeeFormValues}
                        render={({ field: timeField }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-500 mb-2 block">To</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 text-gray-400">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12,6 12,12 16,14"/>
                                  </svg>
                                </div>
                                <Input 
                                  type="time" 
                                  value={timeField.value as string || '17:00'}
                                  onChange={timeField.onChange}
                                  className="flex-1"
                                  disabled={!field.value}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyAvailabilityFields;
