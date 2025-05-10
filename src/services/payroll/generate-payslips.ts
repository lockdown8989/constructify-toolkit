
import { supabase } from '@/integrations/supabase/client';

export const generateMonthlyPayslips = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-monthly-payslips');
    
    if (error) {
      console.error('Error invoking generate-monthly-payslips function:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Exception in generateMonthlyPayslips:', error);
    return { success: false, error };
  }
};
