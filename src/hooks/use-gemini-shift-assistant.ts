
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeminiRequest {
  action: 'generate_pattern' | 'optimize_pattern' | 'assign_shifts' | 'resolve_conflicts';
  data: any;
}

interface GeminiResponse {
  success: boolean;
  result?: string;
  error?: string;
  action?: string;
}

export function useGeminiShiftAssistant() {
  const { toast } = useToast();

  const geminiMutation = useMutation({
    mutationFn: async ({ action, data }: GeminiRequest): Promise<GeminiResponse> => {
      const { data: response, error } = await supabase.functions.invoke('gemini-shift-assistant', {
        body: { action, data }
      });

      if (error) {
        throw new Error(error.message);
      }

      return response;
    },
    onError: (error) => {
      console.error('Gemini AI error:', error);
      toast({
        title: "AI Assistant Error",
        description: "Failed to get AI recommendations. Please try again.",
        variant: "destructive",
      });
    }
  });

  const generatePattern = (requirements: any) => {
    return geminiMutation.mutateAsync({
      action: 'generate_pattern',
      data: requirements
    });
  };

  const optimizePattern = (pattern: any) => {
    return geminiMutation.mutateAsync({
      action: 'optimize_pattern',
      data: pattern
    });
  };

  const suggestAssignments = (employees: any[], patterns: any[]) => {
    return geminiMutation.mutateAsync({
      action: 'assign_shifts',
      data: { employees, patterns }
    });
  };

  const resolveConflicts = (conflicts: any[]) => {
    return geminiMutation.mutateAsync({
      action: 'resolve_conflicts',
      data: conflicts
    });
  };

  return {
    generatePattern,
    optimizePattern,
    suggestAssignments,
    resolveConflicts,
    isLoading: geminiMutation.isPending,
    error: geminiMutation.error
  };
}
