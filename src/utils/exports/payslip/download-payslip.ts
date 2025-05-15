
import { PayslipData } from './types';
import { generatePayslipPDF } from './payslip-generator';
import { useToast } from '@/hooks/use-toast';

/**
 * Download a payslip PDF
 */
export const downloadPayslip = async (payslipData: PayslipData): Promise<Blob> => {
  try {
    // Validate required fields
    if (!payslipData.employeeName || !payslipData.payPeriod) {
      throw new Error('Missing required payslip data');
    }

    // Generate the PDF blob
    const pdfBlob = await generatePayslipPDF(payslipData);
    
    if (!pdfBlob) {
      throw new Error('Failed to generate PDF');
    }
    
    // Create a safe filename
    const safeEmployeeName = payslipData.employeeName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safePayPeriod = payslipData.payPeriod.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `Payslip_${safeEmployeeName}_${safePayPeriod}.pdf`;
    
    // Trigger download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    return pdfBlob;
  } catch (error) {
    console.error('Error downloading payslip:', error);
    throw error;
  }
};

export default downloadPayslip;
