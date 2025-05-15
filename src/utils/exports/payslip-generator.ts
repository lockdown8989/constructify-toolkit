
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PayslipData } from '@/types/supabase/payroll';

export const generatePayslipPDF = async (payslipData: PayslipData): Promise<string> => {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Company header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("TeamPulse HR", pageWidth / 2, 20, { align: 'center' });
  
  // Payslip title
  doc.setFontSize(18);
  doc.setTextColor(60, 60, 60);
  doc.text(payslipData.title || "Monthly Payslip", pageWidth / 2, 30, { align: 'center' });
  
  // Date and reference
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Payment Date: ${payslipData.paymentDate}`, pageWidth - 15, 40, { align: 'right' });
  doc.text(`Reference: PS-${Date.now().toString().substring(0, 10)}`, pageWidth - 15, 45, { align: 'right' });
  
  // Employee information section
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  
  // Employee details table
  autoTable(doc, {
    startY: 50,
    head: [['Employee Details']],
    body: [
      ['Name:', payslipData.name],
      ['Department:', payslipData.department],
      ['Position:', payslipData.position],
      ['Pay Period:', payslipData.payPeriod],
    ],
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [40, 40, 40],
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
    },
  });
  
  // Payment details table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Payment Details']],
    body: [
      ['Gross Pay:', `$${parseFloat(payslipData.grossPay).toFixed(2)}`],
      ['Tax Deductions:', `$${parseFloat(payslipData.taxes).toFixed(2)}`],
      ['Net Pay:', `$${parseFloat(payslipData.netPay).toFixed(2)}`],
      ['Bank Account:', payslipData.bankAccount],
    ],
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [40, 40, 40],
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
    },
  });
  
  // Footer
  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This is an electronically generated document and does not require a signature.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }
  
  // Convert to data URL for preview
  const pdfDataUrl = doc.output('dataurlstring');
  return pdfDataUrl;
};
