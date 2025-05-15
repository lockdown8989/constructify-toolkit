
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';

/**
 * Sends a notification to an employee about their payslip
 */
export const notifyEmployeeAboutPayslip = async (
  employeeId: string,
  userId: string,
  amount: number,
  currency: string = 'GBP',
  paymentDate: string
) => {
  try {
    // Format the payment amount nicely with currency symbol
    const formattedAmount = formatCurrency(amount, currency);
    
    // Format the payment date in a more readable format
    const displayDate = new Date(paymentDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Create notification record in the database
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title: `Payslip Ready: ${formattedAmount}`,
      message: `Your salary payment of ${formattedAmount} for ${displayDate} has been processed and the payslip is now available for download in your account.`,
      type: 'success',
      related_entity: 'payroll',
      related_id: employeeId
    });
    
    if (error) {
      console.error('Error sending payslip notification:', error);
      return false;
    }
    
    // If you have an email notification system, you could trigger it here
    // This would require an edge function to send emails through a service like Resend
    // await sendPayslipEmailNotification(userId, employeeId, formattedAmount, displayDate);
    
    console.log(`Notification sent to user ${userId} about payslip`);
    return true;
  } catch (error) {
    console.error('Exception sending payslip notification:', error);
    return false;
  }
};

/**
 * Sends notifications to multiple employees about their payslips
 */
export const batchNotifyEmployeesAboutPayslips = async (
  employeeData: Array<{
    employeeId: string,
    userId: string,
    amount: number
  }>,
  currency: string = 'GBP',
  paymentDate: string
) => {
  if (!employeeData || employeeData.length === 0) return;
  
  try {
    const displayDate = new Date(paymentDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Prepare notifications for all employees
    const notifications = employeeData.map(employee => ({
      user_id: employee.userId,
      title: `Payslip Ready: ${formatCurrency(employee.amount, currency)}`,
      message: `Your salary payment of ${formatCurrency(employee.amount, currency)} for ${displayDate} has been processed and the payslip is now available for download in your account.`,
      type: 'success',
      related_entity: 'payroll',
      related_id: employee.employeeId
    }));
    
    // Insert all notifications at once
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);
      
    if (error) {
      console.error('Error sending batch payslip notifications:', error);
      return false;
    }
    
    console.log(`Sent payslip notifications to ${notifications.length} employees`);
    return true;
  } catch (error) {
    console.error('Exception sending batch payslip notifications:', error);
    return false;
  }
};
