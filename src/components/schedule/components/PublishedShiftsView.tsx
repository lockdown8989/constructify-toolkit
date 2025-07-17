
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OpenShiftType } from '@/types/supabase/schedules';

const PublishedShiftsView = () => {
  const [openShifts, setOpenShifts] = useState<OpenShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOpenShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('status', 'pending')
        .order('start_time', { ascending: true });

      if (error) throw error;

      console.log('Fetched open shifts:', data);
      setOpenShifts(data || []);
    } catch (error) {
      console.error('Error fetching open shifts:', error);
      toast({
        title: "Error",
        description: "Failed to load open shifts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenShifts();
  }, []);

  const handleApplyToShift = async (shiftId: string) => {
    try {
      // Get current user's employee ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to apply for shifts",
          variant: "destructive"
        });
        return;
      }

      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employee) {
        toast({
          title: "Employee profile not found",
          description: "Please contact your manager",
          variant: "destructive"
        });
        return;
      }

      // Apply for the shift
      const { error } = await supabase
        .from('shift_applications')
        .insert({
          open_shift_id: shiftId,
          employee_id: employee.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully"
      });

      // Refresh the shifts
      fetchOpenShifts();
    } catch (error) {
      console.error('Error applying to shift:', error);
      toast({
        title: "Error",
        description: "Failed to apply for shift",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading shifts...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Available Shifts</h2>
      
      {openShifts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No available shifts at the moment
          </CardContent>
        </Card>
      ) : (
        openShifts.map((shift) => (
          <Card key={shift.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{shift.title}</CardTitle>
                <Badge variant="secondary">Available</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {format(new Date(shift.start_time), 'MMM dd, yyyy')} • {' '}
                    {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                  </span>
                </div>
                
                {shift.role && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="font-medium">{shift.role}</span>
                  </div>
                )}
                
                {shift.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="font-medium">{shift.location}</span>
                  </div>
                )}
                
                {shift.notes && (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-600">Notes:</span>
                    <p className="text-sm">{shift.notes}</p>
                  </div>
                )}
                
                <div className="pt-3">
                  <Button 
                    onClick={() => handleApplyToShift(shift.id)}
                    className="w-full"
                  >
                    Apply for this shift
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PublishedShiftsView;
