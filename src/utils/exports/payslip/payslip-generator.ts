
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PayslipData } from './types';

/**
 * Generate a payslip PDF document
 */
export const generatePayslipPDF = async (payslipData: PayslipData): Promise<Blob> => {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add autotable plugin to jsPDF prototype
    (jsPDF as any).API.autoTable = autoTable;

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
    let currentY = 50;
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
    
    const employeeTableResult = doc.previousAutoTable;
    currentY = (employeeTableResult?.finalY || 90) + 10;
    
    // Payment information section
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
    
    const paymentTableResult = doc.previousAutoTable;
    currentY = (paymentTableResult?.finalY || currentY + 30) + 10;
    
    // Earnings section
    doc.setFont('helvetica', 'bold');
    doc.text('Earnings', 15, currentY);
    
    doc.setFont('helvetica', 'normal');
    
    // Helper function for currency formatting
    function formatCurrency(amount: number, currency: string): string {
      if (isNaN(amount)) return `${currency} 0.00`;
      return `${currency} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
    
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
    
    const earningsTableResult = doc.previousAutoTable;
    currentY = (earningsTableResult?.finalY || currentY + 50) + 10;
    
    // Deductions section
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
    
    const deductionsTableResult = doc.previousAutoTable;
    currentY = (deductionsTableResult?.finalY || currentY + 40) + 10;
    
    // Summary section
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
      }
    });
    
    // Add footer with pagination
    const pageCount = doc.internal.getNumberOfPages();
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
    
    // Generate PDF blob with error handling
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default generatePayslipPDF;
