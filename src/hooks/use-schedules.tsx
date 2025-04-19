import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

export interface Schedule {
  id: string;
  title: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  status?: 'confirmed' | 'pending' | 'completed' | 'rejected';
  location?: string;
  is_published?: boolean;
}

export function useSchedules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const query = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      try {
        const { data: employees } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (!employees) {
          console.log('No employee record found for the current user');
          return [];
        }
          
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('employee_id', employees.id)
          .order('start_time', { ascending: true });
          
        if (error) {
          console.error('Error fetching schedules:', error);
          return [];
        }
        
        const processedData = data?.map(schedule => ({
          ...schedule,
          status: schedule.status || 'confirmed'
        })) || [];
        
        console.log('Fetched schedules for employee:', employees.id, processedData.length);
        return processedData;
      } catch (error) {
        console.error('Error in useSchedules hook:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  React.useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for schedules');
    
    const channel = supabase
      .channel('schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        async (payload) => {
          console.log('Received realtime update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const schedule = payload.new;
            toast({
              title: 'Schedule Updated',
              description: `The schedule for ${new Date(schedule.start_time).toLocaleDateString()} has been updated.`,
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Schedule',
              description: 'A new schedule has been assigned.',
            });
          }
          
          await queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  return query;
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (schedule: Partial<Schedule>) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating schedule with data:', schedule);
      
      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          ...schedule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: schedule.status || 'confirmed'
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }
      
      console.log('Schedule created successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidating schedules query after successful creation');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  return {
    createSchedule: mutation,
    isCreating: mutation.isPending,
    error: mutation.error
  };
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (schedule: Schedule) => {
      console.log('Updating schedule:', schedule);
      
      const { data, error } = await supabase
        .from('schedules')
        .update({
          title: schedule.title,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          notes: schedule.notes,
          status: schedule.status,
          location: schedule.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating schedule:', error);
        throw error;
      }
      
      console.log('Schedule updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidating schedules query after successful update');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  return {
    updateSchedule: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
}
