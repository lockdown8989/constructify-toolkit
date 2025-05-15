
import { jsPDF } from 'jspdf';
import { PayslipData, PayslipTableResult } from '../types';
import { formatCurrency } from '@/utils/format';

/**
 * Add earnings section to the payslip
 */
export const addEarningsSection = (doc: jsPDF, payslipData: PayslipData, currentY: number): PayslipTableResult => {
  doc.setFont('helvetica', 'bold');
  doc.text('Earnings', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  
  doc.autoTable({
    startY: currentY + 5,
    head: [['Description', 'Amount']],
    body: [
      ['Base Salary', formatCurrency(payslipData.baseSalary, 'GBP')],
      ['Overtime Pay', formatCurrency(payslipData.overtimePay, 'GBP')],
      ['Bonus', formatCurrency(payslipData.bonus, 'GBP')]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    }
  });
  
  return doc.previousAutoTable || { finalY: currentY + 50 };
};

/**
 * Add deductions section to the payslip
 */
export const addDeductionsSection = (doc: jsPDF, payslipData: PayslipData, currentY: number): PayslipTableResult => {
  doc.setFont('helvetica', 'bold');
  doc.text('Deductions', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  
  doc.autoTable({
    startY: currentY + 5,
    head: [['Description', 'Amount']],
    body: [
      ['Income Tax', formatCurrency(payslipData.taxes, 'GBP')],
      ['Other Deductions', formatCurrency(payslipData.deductions, 'GBP')]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    }
  });
  
  return doc.previousAutoTable || { finalY: currentY + 40 };
};

/**
 * Add summary section to the payslip
 */
export const addSummarySection = (doc: jsPDF, payslipData: PayslipData, currentY: number): PayslipTableResult => {
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  
  doc.autoTable({
    startY: currentY + 5,
    head: [['Description', 'Amount']],
    body: [
      ['Gross Pay', formatCurrency(payslipData.grossPay, 'GBP')],
      ['Total Deductions', formatCurrency(payslipData.taxes + payslipData.deductions, 'GBP')],
      ['Net Pay', formatCurrency(payslipData.netPay, 'GBP')]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      1: {
        font: 'helvetica',
        fontStyle: 'bold'
      }
    },
    didDrawCell: (data) => {
      // Highlight the Net Pay row
      if (data.section === 'body' && data.row.index === 2) {
        doc.setFillColor(240, 240, 240);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(data.cell.text, data.cell.x + data.cell.padding.left, data.cell.y + data.cell.height / 2 + 3);
      }
    }
  });
  
  return doc.previousAutoTable || { finalY: currentY + 60 };
};

/**
 * Add notes section if available
 */
export const addNotesSection = (doc: jsPDF, notes: string, currentY: number): void => {
  doc.setFont('helvetica', 'bold');
  doc.text('Notes', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(notes, 15, currentY + 10);
};

// Re-export from employee-info.ts for payslip-generator.ts to use
export { addEmployeeInfo, addPaymentInfo } from '../sections/employee-info';
