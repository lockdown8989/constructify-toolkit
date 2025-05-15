
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const notifyEmployeeAboutPayslip = async (
  employeeId: string,
  userId: string,
  amount: number,
  currency: string = 'GBP',
  paymentDate: string
) => {
  try {
    // Format the amount with 2 decimal places
    const formattedAmount = amount.toFixed(2);
    
    // Create notification for the employee
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '💰 Payslip Ready',
        message: `Your payslip for ${format(new Date(paymentDate), 'MMMM yyyy')} is now available. Amount: ${currency} ${formattedAmount}`,
        type: 'success',
        related_entity: 'payroll',
        related_id: employeeId
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error sending payslip notification:', error);
    return { success: false, error };
  }
};

// Send email notification about payslip (would require an edge function in real implementation)
export const emailPayslipNotification = async (
  userId: string,
  amount: number,
  currency: string,
  paymentDate: string
) => {
  try {
    // In a real implementation, this would call a Supabase Edge Function that sends emails
    console.log(`Email notification would be sent to user ${userId} about their payslip.`);
    return { success: true };
  } catch (error) {
    console.error('Error sending payslip email notification:', error);
    return { success: false, error };
  }
};
