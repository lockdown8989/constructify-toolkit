
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PayslipData } from './types';
import { 
  addCompanyHeader,
  addEmployeeInfo,
  addPaymentInfo,
  addEarningsSection,
  addDeductionsSection,
  addSummarySection,
  addNotesSection,
  addFooter
} from './payslip-utils';

/**
 * Generate a payslip PDF document
 */
export const generatePayslipPDF = async (payslipData: PayslipData): Promise<Blob> => {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Company logo and header
  addCompanyHeader(doc);
  
  // Employee information section - starting at Y position 50
  let currentY = 50;
  const employeeResult = addEmployeeInfo(doc, payslipData, currentY);
  const empTableHeight = employeeResult ? employeeResult.finalY : 90;
  currentY = empTableHeight + 10;
  
  // Payment information section
  const paymentResult = addPaymentInfo(doc, payslipData, currentY);
  const paymentTableHeight = paymentResult ? paymentResult.finalY : currentY + 30;
  currentY = paymentTableHeight + 10;
  
  // Earnings section
  const earningsResult = addEarningsSection(doc, payslipData, currentY);
  const earningsTableHeight = earningsResult ? earningsResult.finalY : currentY + 50;
  currentY = earningsTableHeight + 10;
  
  // Deductions section
  const deductionsResult = addDeductionsSection(doc, payslipData, currentY);
  const deductionsTableHeight = deductionsResult ? deductionsResult.finalY : currentY + 40;
  currentY = deductionsTableHeight + 10;
  
  // Summary section
  const summaryResult = addSummarySection(doc, payslipData, currentY);
  
  // Notes section (if available)
  if (payslipData.notes) {
    const summaryTableHeight = summaryResult ? summaryResult.finalY : currentY + 60;
    currentY = summaryTableHeight + 10;
    addNotesSection(doc, payslipData.notes, currentY);
  }
  
  // Footer with pagination
  addFooter(doc);
  
  // Generate PDF blob
  return doc.output('blob');
};

export default generatePayslipPDF;
