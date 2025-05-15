
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PayslipData } from '@/types/supabase/payroll';

export const generatePayslipPDF = (employeeId: string, payslipData: PayslipData): Blob => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFillColor(44, 62, 80); // Dark blue header
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('TeamPulse', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Employee Payslip', 105, 30, { align: 'center' });
  
  // Employee information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Employee: ${payslipData.employeeName}`, 20, 50);
  doc.text(`Position: ${payslipData.position}`, 20, 60);
  doc.text(`Department: ${payslipData.department}`, 20, 70);
  doc.text(`Employee ID: ${payslipData.employeeId}`, 20, 80);
  
  // Period and reference
  doc.text(`Pay Period: ${payslipData.period}`, 120, 50);
  doc.text(`Reference ID: ${payslipData.id.substring(0, 8)}`, 120, 60);
  doc.text(`Date Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 120, 70);
  
  // Earnings table
  autoTable(doc, {
    head: [['Earnings', 'Amount']],
    body: [
      ['Base Salary', `${payslipData.currency} ${payslipData.baseSalary.toFixed(2)}`],
      ['Overtime Pay', `${payslipData.currency} ${payslipData.overtimePay.toFixed(2)}`],
      ['Bonus', `${payslipData.currency} ${payslipData.bonus.toFixed(2)}`]
    ],
    startY: 90,
    theme: 'striped',
    headStyles: { fillColor: [44, 62, 80], textColor: 255 },
    styles: { fontSize: 10 }
  });
  
  // Deductions table
  autoTable(doc, {
    head: [['Deductions', 'Amount']],
    body: [
      ['Tax', `${payslipData.currency} ${(payslipData.deductions * 0.7).toFixed(2)}`],
      ['Insurance', `${payslipData.currency} ${(payslipData.deductions * 0.2).toFixed(2)}`],
      ['Other Deductions', `${payslipData.currency} ${(payslipData.deductions * 0.1).toFixed(2)}`],
      ['Total Deductions', `${payslipData.currency} ${payslipData.deductions.toFixed(2)}`]
    ],
    startY: doc.lastAutoTable.finalY + 10,
    theme: 'striped',
    headStyles: { fillColor: [44, 62, 80], textColor: 255 },
    styles: { fontSize: 10 }
  });
  
  // Total pay
  const totalY = doc.lastAutoTable.finalY + 20;
  doc.setFillColor(44, 62, 80);
  doc.rect(100, totalY - 10, 90, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`TOTAL NET PAY: ${payslipData.currency} ${payslipData.totalPay.toFixed(2)}`, 145, totalY, { align: 'center' });
  
  // Footer
  const footerY = totalY + 30;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('This is a computer-generated document. No signature is required.', 105, footerY, { align: 'center' });
  
  // Add page number
  doc.setFontSize(8);
  doc.text(`Page 1 of 1`, 105, footerY + 10, { align: 'center' });
  
  // Return the PDF as a blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export const downloadPayslip = async (employeeId: string, payslipData: PayslipData) => {
  try {
    const pdfBlob = generatePayslipPDF(employeeId, payslipData);
    const url = URL.createObjectURL(pdfBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `payslip_${payslipData.employeeId}_${payslipData.period.replace(/\s/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading payslip:', error);
    throw error;
  }
};
