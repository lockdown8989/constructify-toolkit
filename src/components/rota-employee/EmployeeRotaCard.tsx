import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Trash2, Edit } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import ShiftAddDialog from './ShiftAddDialog';
import ShiftEditDialog from './ShiftEditDialog';

interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  status: string;
  monday_available?: boolean;
  monday_start_time?: string;
  monday_end_time?: string;
  tuesday_available?: boolean;
  tuesday_start_time?: string;
  tuesday_end_time?: string;
  wednesday_available?: boolean;
  wednesday_start_time?: string;
  wednesday_end_time?: string;
  thursday_available?: boolean;
  thursday_start_time?: string;
  thursday_end_time?: string;
  friday_available?: boolean;
  friday_start_time?: string;
  friday_end_time?: string;
  saturday_available?: boolean;
  saturday_start_time?: string;
  saturday_end_time?: string;
  sunday_available?: boolean;
  sunday_start_time?: string;
  sunday_end_time?: string;
}

interface EmployeeRotaCardProps {
  employee: Employee;
  onDateClick: (date: Date) => void;
  currentView: 'week' | 'month' | 'list';
}

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  notes?: string;
}

const EmployeeRotaCard: React.FC<EmployeeRotaCardProps> = ({
  employee,
  onDateClick,
  currentView
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get week days starting from Monday
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const getAvailabilityForDay = (dayName: string) => {
    const available = employee[`${dayName}_available` as keyof Employee] as boolean;
    const startTime = employee[`${dayName}_start_time` as keyof Employee] as string;
    const endTime = employee[`${dayName}_end_time` as keyof Employee] as string;
    
    return {
      available: available ?? false,
      startTime: startTime || '09:00:00',
      endTime: endTime || '17:00:00'
    };
  };

  const getShiftsForDay = (dayName: string) => {
    const today = new Date();
    const dayIndex = dayNames.indexOf(dayName);
    const targetDate = addDays(weekStart, dayIndex);
    
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.start_time);
      return isSameDay(shiftDate, targetDate);
    });
  };

  const handleAddShift = async (shiftData: {
    startTime: string;
    endTime: string;
    title: string;
    notes?: string;
  }) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const dayIndex = dayNames.indexOf(selectedDay);
      const targetDate = addDays(weekStart, dayIndex);
      
      const startDateTime = new Date(targetDate);
      const [startHour, startMinute] = shiftData.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      
      const endDateTime = new Date(targetDate);
      const [endHour, endMinute] = shiftData.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const { data, error } = await supabase
        .from('schedules')
        .insert({
          employee_id: employee.id,
          title: shiftData.title,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: shiftData.notes,
          status: 'confirmed',
          published: true,
          created_platform: 'desktop',
          last_modified_platform: 'desktop',
          is_draft: false,
          can_be_edited: true
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setShifts(prev => [...prev, {
        id: data.id,
        start_time: data.start_time,
        end_time: data.end_time,
        title: data.title,
        notes: data.notes
      }]);

      toast({
        title: "Shift added successfully",
        description: `Added shift for ${employee.name} on ${selectedDay}`,
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding shift:', error);
      toast({
        title: "Error adding shift",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditShift = async (shiftData: {
    startTime: string;
    endTime: string;
    title: string;
    notes?: string;
  }) => {
    if (!selectedShift) return;

    setIsLoading(true);
    try {
      const shiftDate = new Date(selectedShift.start_time);
      const startDateTime = new Date(shiftDate);
      const [startHour, startMinute] = shiftData.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      
      const endDateTime = new Date(shiftDate);
      const [endHour, endMinute] = shiftData.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const { error } = await supabase
        .from('schedules')
        .update({
          title: shiftData.title,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: shiftData.notes,
          updated_at: new Date().toISOString(),
          last_modified_platform: 'desktop'
        })
        .eq('id', selectedShift.id);

      if (error) throw error;

      // Update local state
      setShifts(prev => prev.map(shift => 
        shift.id === selectedShift.id 
          ? {
              ...shift,
              start_time: startDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              title: shiftData.title,
              notes: shiftData.notes
            }
          : shift
      ));

      toast({
        title: "Shift updated successfully",
        description: `Updated shift for ${employee.name}`,
      });

      setIsEditDialogOpen(false);
      setSelectedShift(null);
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({
        title: "Error updating shift",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      // Remove from local state
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));

      toast({
        title: "Shift deleted successfully",
        description: `Removed shift for ${employee.name}`,
      });
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error deleting shift",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = (dayName: string) => {
    setSelectedDay(dayName);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (shift: Shift, dayName: string) => {
    setSelectedShift(shift);
    setSelectedDay(dayName);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg">{employee.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{employee.job_title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{shifts.length} shifts</Badge>
              <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {dayNames.map((dayName, index) => {
              const availability = getAvailabilityForDay(dayName);
              const dayShifts = getShiftsForDay(dayName);
              const dayDate = weekDays[index];

              return (
                <div key={dayName} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium capitalize">
                      {dayName.substring(0, 3)}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      availability.available ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>

                  {availability.available && (
                    <div className="text-xs text-muted-foreground">
                      {availability.startTime.substring(0, 5)} - {availability.endTime.substring(0, 5)}
                    </div>
                  )}

                  {/* Existing Shifts */}
                  <div className="space-y-1">
                    {dayShifts.map((shift) => (
                      <div key={shift.id} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-blue-800">
                              {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-blue-100"
                              onClick={() => openEditDialog(shift, dayName)}
                              disabled={isLoading}
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-red-100"
                              onClick={() => handleDeleteShift(shift.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-blue-700 font-medium mt-1">
                          {shift.title}
                        </div>
                        {shift.notes && (
                          <div className="text-blue-600 text-xs mt-1 truncate">
                            {shift.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Shift Button */}
                  {availability.available ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 border-dashed text-xs"
                      onClick={() => openAddDialog(dayName)}
                      disabled={isLoading}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                      <span className="text-xs text-red-600">Not Available</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ShiftAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddShift}
        employeeName={employee.name}
        day={selectedDay}
        defaultAvailability={selectedDay ? getAvailabilityForDay(selectedDay) : undefined}
        isLoading={isLoading}
      />

      <ShiftEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedShift(null);
        }}
        onSave={handleEditShift}
        shift={selectedShift}
        employeeName={employee.name}
        day={selectedDay}
        isLoading={isLoading}
      />
    </>
  );
};

export default EmployeeRotaCard;
