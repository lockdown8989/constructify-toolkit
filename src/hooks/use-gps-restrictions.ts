
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GPSRestriction {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useGPSRestrictions = () => {
  const [restrictions, setRestrictions] = useState<GPSRestriction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRestrictions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gps_clocking_restrictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRestrictions(data || []);
    } catch (error) {
      console.error('Error fetching GPS restrictions:', error);
      toast({
        title: "Error",
        description: "Failed to load GPS restrictions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRestriction = async (restriction: {
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('gps_clocking_restrictions')
        .insert([restriction])
        .select()
        .single();

      if (error) throw error;

      setRestrictions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding GPS restriction:', error);
      throw error;
    }
  };

  const updateRestriction = async (id: string, updates: Partial<GPSRestriction>) => {
    try {
      const { data, error } = await supabase
        .from('gps_clocking_restrictions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRestrictions(prev => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (error) {
      console.error('Error updating GPS restriction:', error);
      throw error;
    }
  };

  const deleteRestriction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gps_clocking_restrictions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRestrictions(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting GPS restriction:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRestrictions();
  }, []);

  return {
    restrictions,
    isLoading,
    addRestriction,
    updateRestriction,
    deleteRestriction,
    refetch: fetchRestrictions
  };
};
