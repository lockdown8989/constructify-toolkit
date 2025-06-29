
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { useEmployees } from '@/hooks/use-employees';
import { useEmployeeAvailabilitySync } from '@/hooks/use-employee-availability-sync';

const WeeklyAvailabilitySection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: employees } = useEmployees();
  const { updateAvailability, isUpdating } = useEmployeeAvailabilitySync();
  
  // Find the current user's employee record
  const currentEmployee = employees?.find(emp => emp.user_id === user?.id);
  
  const [availability, setAvailability] = useState({
    monday_available: currentEmployee?.monday_available ?? true,
    monday_start_time: currentEmployee?.monday_start_time || '09:00',
    monday_end_time: currentEmployee?.monday_end_time || '17:00',
    tuesday_available: currentEmployee?.tuesday_available ?? true,
    tuesday_start_time: currentEmployee?.tuesday_start_time || '09:00',
    tuesday_end_time: currentEmployee?.tuesday_end_time || '17:00',
    wednesday_available: currentEmployee?.wednesday_available ?? true,
    wednesday_start_time: currentEmployee?.wednesday_start_time || '09:00',
    wednesday_end_time: currentEmployee?.wednesday_end_time || '17:00',
    thursday_available: currentEmployee?.thursday_available ?? true,
    thursday_start_time: currentEmployee?.thursday_start_time || '09:00',
    thursday_end_time: currentEmployee?.thursday_end_time || '17:00',
    friday_available: currentEmployee?.friday_available ?? true,
    friday_start_time: currentEmployee?.friday_start_time || '09:00',
    friday_end_time: currentEmployee?.friday_end_time || '17:00',
    saturday_available: currentEmployee?.saturday_available ?? true,
    saturday_start_time: currentEmployee?.saturday_start_time || '09:00',
    saturday_end_time: currentEmployee?.saturday_end_time || '17:00',
    sunday_available: currentEmployee?.sunday_available ?? true,
    sunday_start_time: currentEmployee?.sunday_start_time || '09:00',
    sunday_end_time: currentEmployee?.sunday_end_time || '17:00',
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  const handleAvailabilityToggle = (day: string, isAvailable: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [`${day}_available`]: isAvailable,
      // Set default times when enabling
      [`${day}_start_time`]: isAvailable && !prev[`${day}_start_time` as keyof typeof prev] ? '09:00' : prev[`${day}_start_time` as keyof typeof prev],
      [`${day}_end_time`]: isAvailable && !prev[`${day}_end_time` as keyof typeof prev] ? '17:00' : prev[`${day}_end_time` as keyof typeof prev],
    }));
  };

  const handleTimeChange = (day: string, timeType: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [`${day}_${timeType}_time`]: value,
    }));
  };

  const handleSave = () => {
    if (!currentEmployee) {
      toast({
        title: "Error",
        description: "Employee record not found. Please contact your manager.",
        variant: "destructive",
      });
      return;
    }

    updateAvailability({
      employeeId: currentEmployee.id,
      ...availability,
    });
  };

  if (!currentEmployee) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Employee record not found. Please contact your manager to set up your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Weekly Availability
        </CardTitle>
        <p className="text-sm text-gray-600">
          Set your regular weekly availability. This helps managers schedule shifts and you'll receive 🔔 notifications 10 minutes before your shifts start and end.
        </p>
      </CardHeader>
      <CardContent>
        <Separator className="mb-6" />
        
        <div className="space-y-6">
          {daysOfWeek.map(({ key, label }) => {
            const isAvailable = availability[`${key}_available` as keyof typeof availability];
            
            return (
              <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{label}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Available</span>
                    <div className="flex items-center space-x-2">
                      <span className={`w-4 h-4 rounded-full transition-colors ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <Switch 
                        checked={!!isAvailable}
                        onCheckedChange={(checked) => handleAvailabilityToggle(key, checked)}
                        className={isAvailable ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                      />
                    </div>
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-6 transition-all duration-300 ${isAvailable ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">From</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 text-gray-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <Input 
                        type="time" 
                        value={availability[`${key}_start_time` as keyof typeof availability] as string || '09:00'}
                        onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                        className="flex-1"
                        disabled={!isAvailable}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">To</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 text-gray-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <Input 
                        type="time" 
                        value={availability[`${key}_end_time` as keyof typeof availability] as string || '17:00'}
                        onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                        className="flex-1"
                        disabled={!isAvailable}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button onClick={handleSave} disabled={isUpdating} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyAvailabilitySection;
