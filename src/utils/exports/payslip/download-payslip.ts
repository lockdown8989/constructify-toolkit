
import { PayslipData } from './types';
import { generatePayslipPDF } from './payslip-generator';

/**
 * Download a payslip PDF
 */
export const downloadPayslip = async (payslipData: PayslipData): Promise<Blob> => {
  // Generate the PDF blob
  const pdfBlob = await generatePayslipPDF(payslipData);
  
  // Trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(pdfBlob);
  link.download = `Payslip_${payslipData.employeeName.replace(/\s+/g, '_')}_${payslipData.payPeriod}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
  
  return pdfBlob;
};

export default downloadPayslip;
