
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Use the safe signout function first
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Sign out error:', signOutError);
        // Even if there's an error, we should still navigate to auth page
        // This prevents users from being stuck in a broken state
      }
      
      // Clear any local storage or session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Navigate to auth page regardless of signout success/failure
      navigate('/auth', { replace: true });
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Still navigate to auth page even on unexpected errors
      navigate('/auth', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('delete-user-account');
      
      if (error) {
        throw error;
      }
      
      if (data?.success) {
        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Navigate to auth page
        navigate('/auth', { replace: true });
        
        return { success: true };
      } else {
        return { success: false, error: data?.error || 'Failed to delete account' };
      }
    } catch (error: any) {
      console.error('Account deletion error:', error);
      return { success: false, error: error.message || 'Failed to delete account' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
    deleteAccount,
    isLoading
  };
};
