
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Location {
  id: string;
  name: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      // For now, we'll use a local storage approach since we don't have a locations table
      const savedLocations = localStorage.getItem('company_locations');
      if (savedLocations) {
        return JSON.parse(savedLocations) as Location[];
      }
      
      // Default locations
      const defaultLocations: Location[] = [
        { id: '1', name: 'Main Location' },
        { id: '2', name: 'Downtown Branch' },
        { id: '3', name: 'Uptown Office' }
      ];
      
      localStorage.setItem('company_locations', JSON.stringify(defaultLocations));
      return defaultLocations;
    }
  });
}

export function useAddLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newLocation: Omit<Location, 'id'>) => {
      const savedLocations = localStorage.getItem('company_locations');
      const locations: Location[] = savedLocations ? JSON.parse(savedLocations) : [];
      
      const location: Location = {
        id: Date.now().toString(),
        ...newLocation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedLocations = [...locations, location];
      localStorage.setItem('company_locations', JSON.stringify(updatedLocations));
      
      return location;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Location added",
        description: "New location has been successfully added."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add location",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (locationId: string) => {
      const savedLocations = localStorage.getItem('company_locations');
      const locations: Location[] = savedLocations ? JSON.parse(savedLocations) : [];
      
      const updatedLocations = locations.filter(loc => loc.id !== locationId);
      localStorage.setItem('company_locations', JSON.stringify(updatedLocations));
      
      return locationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Location deleted",
        description: "Location has been successfully removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete location",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
