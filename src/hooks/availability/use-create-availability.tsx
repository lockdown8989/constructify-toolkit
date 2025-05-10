
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { NewAvailabilityRequest } from '@/types/availability';
import { getManagerUserIds } from '@/services/notifications/role-utils';
import { sendNotificationsToMany } from '@/services/notifications/notification-sender';

export function useCreateAvailabilityRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const createRequest = async (requestData: NewAvailabilityRequest) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create availability requests",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsLoading(true);
    
    try {
      // Get the employee ID for the current user
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (employeeError) {
        throw new Error("Employee record not found. Please contact HR to set up your account.");
      }
      
      // Insert the availability request
      const { data, error } = await supabase
        .from('availability_requests')
        .insert({
          employee_id: employeeData.id,
          date: requestData.date,
          start_time: requestData.startTime,
          end_time: requestData.endTime,
          is_available: requestData.isAvailable,
          notes: requestData.notes
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Notify managers about the new availability request
      const managerIds = await getManagerUserIds();
      
      if (managerIds.length > 0) {
        await sendNotificationsToMany(managerIds, {
          title: 'New Availability Request',
          message: `A team member has submitted a new availability request for ${new Date(requestData.date).toLocaleDateString()}.`,
          type: 'info',
          related_entity: 'availability_requests',
          related_id: data.id
        });
      }
      
      toast({
        title: "Request submitted",
        description: `Your availability for ${new Date(requestData.date).toLocaleDateString()} has been submitted for approval.`,
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creating availability request:', error);
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Failed to submit availability request",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    createRequest,
    isLoading
  };
}
