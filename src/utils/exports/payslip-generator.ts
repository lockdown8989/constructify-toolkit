
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PayslipData } from '@/types/supabase/payroll';
import { formatCurrency } from '@/utils/format';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export const generatePayslipPDF = async (payslipData: PayslipData): Promise<string> => {
  const { 
    employeeName, 
    position, 
    department, 
    period, 
    baseSalary, 
    overtimePay, 
    bonus, 
    deductions,
    totalPay,
    currency
  } = payslipData;

  // Create a new PDF document
  const doc = new jsPDF();
  const textColor = '#333333';
  const headerColor = '#4a86e8';

  // Add company header
  doc.setFontSize(22);
  doc.setTextColor(headerColor);
  doc.text('COMPANY NAME', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('PAYSLIP', 105, 30, { align: 'center' });

  // Add payslip period
  doc.setFontSize(12);
  doc.setTextColor(textColor);
  doc.text(`Pay Period: ${period}`, 105, 40, { align: 'center' });

  // Add employee details
  doc.setFontSize(12);
  doc.text('Employee Details', 14, 55);

  // Add employee information table
  doc.autoTable({
    startY: 60,
    head: [['Name', 'Position', 'Department']],
    body: [[employeeName, position, department]],
    theme: 'grid',
    styles: {
      fontSize: 10,
      textColor: textColor,
      lineColor: '#cccccc',
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [50, 50, 50],
      fontStyle: 'bold',
    },
  });

  // Add earnings table
  doc.setFontSize(12);
  doc.text('Earnings & Deductions', 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 100);

  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 105,
    head: [['Description', 'Amount']],
    body: [
      ['Base Salary', formatCurrency(baseSalary, currency)],
      ['Overtime Pay', formatCurrency(overtimePay, currency)],
      ['Bonus', formatCurrency(bonus, currency)],
      ['Deductions', `- ${formatCurrency(deductions, currency)}`],
      ['Total Pay', formatCurrency(totalPay, currency)],
    ],
    theme: 'grid',
    styles: {
      fontSize: 10,
      textColor: textColor,
      lineColor: '#cccccc',
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [50, 50, 50],
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
    },
  });

  // Add footer with signature
  const finalY = doc.lastAutoTable?.finalY || 150;
  doc.text('Authorized Signature: _________________________', 14, finalY + 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, finalY + 40);

  // Add confidentiality notice
  doc.setFontSize(8);
  doc.setTextColor('#666666');
  doc.text('This document is confidential and intended for the named employee only.', 105, 280, { align: 'center' });

  // Convert the PDF to a blob and return the URL
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
};

export const downloadPayslipPDF = (payslipData: PayslipData) => {
  generatePayslipPDF(payslipData).then((url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${payslipData.employeeName.replace(/\s+/g, '_')}_${payslipData.period}.pdf`;
    link.click();
  }).catch(error => {
    console.error('Error generating payslip PDF:', error);
  });
};
