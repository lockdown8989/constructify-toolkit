
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
  ];

  const handleCancel = () => {
    // Reset form to default values
    form.reset();
  };

  const handleSaveAvailability = () => {
    // Trigger form validation and submission
    form.handleSubmit((data) => {
      console.log('Availability data saved:', data);
      // The actual form submission will be handled by the parent form
    })();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Weekly Availability</h2>
            <p className="text-gray-600">
              Set your regular weekly availability. This helps managers schedule shifts that work for you.
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
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <Switch 
                        checked={true}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-gray-500 mb-2 block">From</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <Input 
                        type="time" 
                        defaultValue="09:00"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 mb-2 block">To</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <Input 
                        type="time" 
                        defaultValue="17:00"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex space-x-4">
            <Button 
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 py-3 px-4"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSaveAvailability}
              className="flex-1 py-3 px-4 bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyAvailabilityFields;
