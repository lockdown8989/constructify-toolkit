
import { jsPDF } from 'jspdf';
import { PayslipData, PayslipTableResult } from '../types';

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
  
  return doc.previousAutoTable || { finalY: currentY + 30 };
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
  
  return doc.previousAutoTable || { finalY: currentY + 30 };
};
