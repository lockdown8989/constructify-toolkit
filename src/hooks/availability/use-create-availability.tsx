import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export type AvailabilityRequest = {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export type NewAvailabilityRequest = Omit<AvailabilityRequest, 'id' | 'status'>;

export function useCreateAvailabilityRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRequest = async (requestData: NewAvailabilityRequest) => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!requestData.employee_id || !requestData.date || 
          !requestData.start_time || !requestData.end_time) {
        throw new Error('Missing required fields for availability request');
      }

      // Insert the availability request
      const { data, error } = await supabase
        .from('availability_requests')
        .insert({
          employee_id: requestData.employee_id,
          date: requestData.date,
          start_time: requestData.start_time,
          end_time: requestData.end_time,
          is_available: requestData.is_available,
          notes: requestData.notes,
          status: 'Pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update cached data
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });

      toast({
        title: "Availability Request Submitted",
        description: "Your availability request has been submitted for approval."
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating availability request:', error);
      
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to submit availability request",
        variant: "destructive"
      });

      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { createRequest, isLoading };
}
