
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PayslipData } from '@/types/supabase/payroll';

const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

// Create PDF payslip and return as blob
export const generatePayslipPDF = (data: PayslipData): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add company header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('TeamPulse', 15, 20);
  doc.setFontSize(12);
  doc.text('Employee Payslip', 15, 30);

  // Employee details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Employee Details', 15, 50);
  
  doc.setFontSize(10);
  const employeeDetails = [
    ['Employee Name:', data.employeeName],
    ['Position:', data.position],
    ['Department:', data.department],
    ['Pay Period:', data.period],
    ['Payment Date:', new Date(data.paymentDate).toLocaleDateString()]
  ];
  
  autoTable(doc, {
    startY: 55,
    head: [],
    body: employeeDetails,
    theme: 'plain',
    styles: {
      cellPadding: 2,
      fontSize: 10
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 }
    }
  });
  
  // Payment details
  doc.setFontSize(14);
  doc.text('Payment Details', 15, 105);
  
  const paymentDetails = [
    ['Base Salary:', formatCurrency(data.baseSalary, data.currency)],
    ['Gross Pay:', formatCurrency(data.grossPay, data.currency)],
    ['Deductions:', formatCurrency(data.deductions, data.currency)],
    ['Net Pay:', formatCurrency(data.netPay, data.currency)]
  ];
  
  autoTable(doc, {
    startY: 110,
    head: [],
    body: paymentDetails,
    theme: 'plain',
    styles: {
      cellPadding: 2,
      fontSize: 10
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 }
    }
  });
  
  // Additional notes
  if (data.notes) {
    doc.setFontSize(14);
    doc.text('Notes', 15, 160);
    doc.setFontSize(10);
    doc.text(data.notes, 15, 170);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 15, 280);
  
  return doc.output('blob');
};

// Download payslip as PDF
export const downloadPayslip = (data: PayslipData): void => {
  const blob = generatePayslipPDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `Payslip_${data.employeeName.replace(/\s+/g, '_')}_${data.period.replace(/\s+/g, '_')}.pdf`;
  
  link.href = url;
  link.download = fileName;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
};
