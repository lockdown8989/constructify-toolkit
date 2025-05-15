
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PayslipData, PayslipTableResult } from './types';
import { 
  addCompanyHeader,
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
  const empTableHeight = employeeResult?.finalY || 90;
  currentY = empTableHeight + 10;
  
  // Payment information section
  const paymentResult = addPaymentInfo(doc, payslipData, currentY);
  const paymentTableHeight = paymentResult?.finalY || currentY + 30;
  currentY = paymentTableHeight + 10;
  
  // Earnings section
  const earningsResult = addEarningsSection(doc, payslipData, currentY);
  const earningsTableHeight = earningsResult?.finalY || currentY + 50;
  currentY = earningsTableHeight + 10;
  
  // Deductions section
  const deductionsResult = addDeductionsSection(doc, payslipData, currentY);
  const deductionsTableHeight = deductionsResult?.finalY || currentY + 40;
  currentY = deductionsTableHeight + 10;
  
  // Summary section
  const summaryResult = addSummarySection(doc, payslipData, currentY);
  
  // Notes section (if available)
  if (payslipData.notes) {
    const summaryTableHeight = summaryResult?.finalY || currentY + 60;
    currentY = summaryTableHeight + 10;
    addNotesSection(doc, payslipData.notes, currentY);
  }
  
  // Footer with pagination
  addFooter(doc);
  
  // Generate PDF blob
  return doc.output('blob');
};

// Import these functions dynamically to avoid circular dependencies
import { 
  addEmployeeInfo,
  addPaymentInfo,
  addEarningsSection,
  addDeductionsSection,
  addSummarySection,
  addNotesSection,
} from './sections/financial';

export default generatePayslipPDF;
