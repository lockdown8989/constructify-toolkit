
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';
import { sendNotification } from './notification-sender';

/**
 * Sends a notification to an employee about their payslip
 */
export const notifyEmployeeAboutPayslip = async (
  employeeId: string,
  userId: string,
  amount: number,
  currency: string = 'GBP',
  paymentDate: string,
  documentUrl?: string
) => {
  try {
    const formattedAmount = formatCurrency(amount, currency);
    const displayDate = new Date(paymentDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const message = documentUrl 
      ? `Your salary payment of ${formattedAmount} for ${displayDate} has been processed and your payslip is now available for download.`
      : `Your salary payment of ${formattedAmount} for ${displayDate} has been processed.`;
    
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title: `💰 Payslip Ready: ${formattedAmount}`,
      message,
      type: 'success',
      related_entity: 'payroll',
      related_id: employeeId
    });
    
    if (error) {
      console.error('Error sending payslip notification:', error);
      return false;
    }
    
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
    amount: number,
    documentUrl?: string
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
    
    const notifications = employeeData.map(employee => {
      const formattedAmount = formatCurrency(employee.amount, currency);
      
      const message = employee.documentUrl 
        ? `Your salary payment of ${formattedAmount} for ${displayDate} has been processed and your payslip is now available for download.`
        : `Your salary payment of ${formattedAmount} for ${displayDate} has been processed.`;
        
      return {
        user_id: employee.userId,
        title: `💰 Payslip Ready: ${formattedAmount}`,
        message,
        type: 'success',
        related_entity: 'payroll',
        related_id: employee.employeeId
      };
    });
    
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);
      
    if (error) {
      console.error('Error sending batch payslip notifications:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception sending batch payslip notifications:', error);
    return false;
  }
};

/**
 * Notifies an employee about a new document assignment (contract or payslip)
 */
export const notifyEmployeeAboutDocument = async (
  userId: string,
  documentType: 'payslip' | 'contract',
  documentName?: string
) => {
  try {
    const title = documentType === 'payslip' 
      ? '📄 New Payslip Available' 
      : '📄 New Contract Available';
      
    const message = documentName
      ? `A new ${documentType} document (${documentName}) is now available in your documents section.`
      : `A new ${documentType} document is now available in your documents section.`;
      
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'info',
      related_entity: 'documents'
    });
    
    if (error) {
      console.error(`Error sending ${documentType} notification:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Exception sending ${documentType} notification:`, error);
    return false;
  }
};
