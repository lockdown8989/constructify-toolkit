
import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { recordCalendarAction } from '@/utils/calendar-actions';

interface AddShiftFABProps {
  onClick: () => void;
  isVisible?: boolean;
}

const AddShiftFAB: React.FC<AddShiftFABProps> = ({ onClick, isVisible = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      // Log the FAB interaction
      if (user) {
        await recordCalendarAction('fab_add_shift_clicked', new Date(), {
          platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
          timestamp: Date.now()
        });
      }
      
      // Call the provided onClick handler
      onClick();
    } catch (error) {
      console.error('Error clicking FAB:', error);
      toast({
        title: "Error",
        description: "Something went wrong when trying to add a shift",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 p-0 flex items-center justify-center"
      aria-label="Add shift"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Plus className="h-6 w-6" />
      )}
    </Button>
  );
};

export default AddShiftFAB;
