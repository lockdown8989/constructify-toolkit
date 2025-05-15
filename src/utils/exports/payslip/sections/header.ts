
import { jsPDF } from 'jspdf';

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
 * Add footer with pagination
 */
export const addFooter = (doc: jsPDF): void => {
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
};
