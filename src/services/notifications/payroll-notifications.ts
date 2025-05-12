
import { sendNotification } from './notification-sender';
import { formatCurrency } from '@/utils/format';

/**
 * Notify employee about a generated payslip
 */
export const notifyEmployeeAboutPayslip = async (
  employeeId: string,
  userId: string,
  salaryAmount: number,
  currency: string = 'GBP',
  paymentDate: string
) => {
  try {
    const formattedAmount = formatCurrency(salaryAmount, currency);
    const formattedDate = new Date(paymentDate).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const result = await sendNotification({
      user_id: userId,
      title: 'Payslip Generated',
      message: `Your payslip for ${formattedDate} has been generated. Amount: ${formattedAmount}`,
      type: 'success',
      related_entity: 'payroll',
      related_id: employeeId
    });
    
    return result.success;
  } catch (error) {
    console.error('Error sending payslip notification:', error);
    return false;
  }
};

/**
 * Notify managers about completed payroll processing
 */
export const notifyManagersAboutPayrollProcessing = async (
  managerIds: string[],
  successCount: number,
  failCount: number,
  totalAmount: number,
  currency: string = 'GBP'
) => {
  try {
    const formattedAmount = formatCurrency(totalAmount, currency);
    
    for (const managerId of managerIds) {
      await sendNotification({
        user_id: managerId,
        title: 'Payroll Processing Complete',
        message: `Processed ${successCount} payslips (${formattedAmount} total). Failed: ${failCount}.`,
        type: failCount > 0 ? 'warning' : 'success',
        related_entity: 'payroll'
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending payroll processing notification to managers:', error);
    return false;
  }
};
