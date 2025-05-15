
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PayslipData } from '@/types/supabase/payroll';
import { formatCurrency } from '@/utils/format';

// Add type definitions for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    getNumberOfPages: () => number;
  }
}

export const downloadPayslip = async (payslipData: PayslipData): Promise<Blob> => {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Company logo and header
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

  // Employee information section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 15, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Employee details table
  doc.autoTable({
    startY: 55,
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

  // Payment Information - store last Y position
  let currentY = doc.autoTable.lastEndPos?.y || 90;
  currentY += 10;
  
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

  // Earnings section - use lastEndPos to position
  currentY = doc.autoTable.lastEndPos?.y || currentY + 30;
  currentY += 10;
  
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
  
  // Deductions section - use lastEndPos to position
  currentY = doc.autoTable.lastEndPos?.y || currentY + 50;
  currentY += 10;
  
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
  
  // Summary section - use lastEndPos to position
  currentY = doc.autoTable.lastEndPos?.y || currentY + 40;
  currentY += 10;
  
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
  
  // Notes
  if (payslipData.notes) {
    currentY = doc.autoTable.lastEndPos?.y || currentY + 60;
    currentY += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 15, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(payslipData.notes, 15, currentY + 10);
  }
  
  // Footer
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
  
  // Generate PDF blob
  const pdfBlob = doc.output('blob');
  
  // Trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(pdfBlob);
  link.download = `Payslip_${payslipData.employeeName.replace(/\s+/g, '_')}_${payslipData.payPeriod}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
  
  return pdfBlob;
};

// Export as the default so it can be imported with import generatePayslipPDF from
const generatePayslipPDF = downloadPayslip;
export default generatePayslipPDF;
