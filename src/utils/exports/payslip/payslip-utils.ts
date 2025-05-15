
import { jsPDF } from 'jspdf';
import { formatCurrency } from '@/utils/format';
import { PayslipData, PayslipTableResult } from './types';

/**
 * Add company information to the payslip
 */
export const addCompanyHeader = (doc: jsPDF): void => {
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('PAYSLIP', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Company Name Ltd.', 105, 25, { align: 'center' });
  doc.text('123 Business Street, London, UK', 105, 30, { align: 'center' });
  doc.text('Registration No: 12345678', 105, 35, { align: 'center' });

  // Add horizontal line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, 40, 195, 40);
};

/**
 * Add employee information to the payslip
 */
export const addEmployeeInfo = (doc: jsPDF, payslipData: PayslipData, currentY: number): PayslipTableResult => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Employee details table
  doc.autoTable({
    startY: currentY + 5,
    head: [['Employee Name', 'Department', 'Position', 'Pay Period']],
    body: [
      [
        payslipData.employeeName,
        payslipData.department,
        payslipData.position,
        payslipData.payPeriod
      ]
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
  
  return doc.autoTable.previous;
};

/**
 * Add payment information to the payslip
 */
export const addPaymentInfo = (doc: jsPDF, payslipData: PayslipData, currentY: number): PayslipTableResult => {
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Information', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  
  // Payment details table
  doc.autoTable({
    startY: currentY + 5,
    head: [['Payment Date', 'Bank Account', 'Currency']],
    body: [
      [
        new Date(payslipData.paymentDate).toLocaleDateString('en-GB'),
        payslipData.bankAccount,
        payslipData.currency
      ]
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
  
  return doc.autoTable.previous;
};

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
  
  return doc.autoTable.previous;
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
  
  return doc.autoTable.previous;
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
  
  return doc.autoTable.previous;
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

/**
 * Add footer with pagination
 */
export const addFooter = (doc: jsPDF): void => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleDateString('en-GB')}`,
      105,
      287,
      { align: 'center' }
    );
  }
};
