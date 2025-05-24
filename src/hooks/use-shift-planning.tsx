
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShiftTemplate {
  id: string;
  name: string;
  role?: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  days_of_week: number[];
  location?: string;
  requirements: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityPattern {
  id: string;
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_hours?: number;
  preferences: Record<string, any>;
  effective_from: string;
  effective_until?: string;
}

export interface ScheduleConflict {
  id: string;
  schedule_id: string;
  conflict_type: string;
  conflict_details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface LaborCost {
  id: string;
  schedule_id: string;
  base_cost: number;
  overtime_cost: number;
  break_cost: number;
  total_cost: number;
  calculated_at: string;
}

export const useShiftPlanning = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shift templates
  const { data: shiftTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['shift-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ShiftTemplate[];
    }
  });

  // Fetch availability patterns
  const { data: availabilityPatterns = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_patterns')
        .select('*')
        .order('employee_id', { ascending: true });
      
      if (error) throw error;
      return data as AvailabilityPattern[];
    }
  });

  // Fetch schedule conflicts
  const { data: scheduleConflicts = [], isLoading: conflictsLoading } = useQuery({
    queryKey: ['schedule-conflicts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_conflicts')
        .select('*')
        .eq('resolved', false)
        .order('severity', { ascending: false });
      
      if (error) throw error;
      return data as ScheduleConflict[];
    }
  });

  // Fetch labor costs
  const { data: laborCosts = [], isLoading: costsLoading } = useQuery({
    queryKey: ['labor-costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labor_costs')
        .select('*')
        .order('calculated_at', { ascending: false });
      
      if (error) throw error;
      return data as LaborCost[];
    }
  });

  // Create shift template mutation
  const createShiftTemplate = useMutation({
    mutationFn: async (template: Omit<ShiftTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shift_templates')
        .insert([template])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast({
        title: "Template Created",
        description: "Shift template has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create shift template.",
        variant: "destructive",
      });
    }
  });

  // Create availability pattern mutation
  const createAvailabilityPattern = useMutation({
    mutationFn: async (pattern: Omit<AvailabilityPattern, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('availability_patterns')
        .insert([pattern])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-patterns'] });
      toast({
        title: "Availability Updated",
        description: "Employee availability has been updated.",
      });
    }
  });

  // Resolve conflict mutation
  const resolveConflict = useMutation({
    mutationFn: async ({ conflictId, resolutionNotes }: { conflictId: string; resolutionNotes?: string }) => {
      const { data, error } = await supabase
        .from('schedule_conflicts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          // resolved_by would be set by a trigger with auth.uid()
        })
        .eq('id', conflictId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-conflicts'] });
      toast({
        title: "Conflict Resolved",
        description: "Schedule conflict has been marked as resolved.",
      });
    }
  });

  // Auto-schedule function (basic implementation)
  const autoSchedule = useMutation({
    mutationFn: async ({ 
      startDate, 
      endDate, 
      templateIds 
    }: { 
      startDate: Date; 
      endDate: Date; 
      templateIds: string[] 
    }) => {
      // This would implement intelligent scheduling logic
      // For now, we'll create schedules based on templates
      const schedules = [];
      
      for (const templateId of templateIds) {
        const template = shiftTemplates.find(t => t.id === templateId);
        if (!template) continue;
        
        // Create schedules for each day in the template's days_of_week
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          if (template.days_of_week.includes(dayOfWeek)) {
            const startDateTime = new Date(currentDate);
            const [hours, minutes] = template.start_time.split(':');
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const endDateTime = new Date(currentDate);
            const [endHours, endMinutes] = template.end_time.split(':');
            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
            
            schedules.push({
              title: template.name,
              start_time: startDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              location: template.location,
              break_duration: template.break_duration,
              shift_type: 'template_generated',
              status: 'pending',
              requirements: template.requirements
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      if (schedules.length > 0) {
        const { data, error } = await supabase
          .from('schedules')
          .insert(schedules)
          .select();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Auto-Schedule Complete",
        description: `Generated ${data.length} shifts from templates.`,
      });
    }
  });

  return {
    // Data
    shiftTemplates,
    availabilityPatterns,
    scheduleConflicts,
    laborCosts,
    
    // Loading states
    templatesLoading,
    availabilityLoading,
    conflictsLoading,
    costsLoading,
    
    // Mutations
    createShiftTemplate,
    createAvailabilityPattern,
    resolveConflict,
    autoSchedule
  };
};
