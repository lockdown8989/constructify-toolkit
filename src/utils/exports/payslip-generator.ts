
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export interface PayslipData {
  name: string;
  title: string;
  department: string;
  salary: string;
  paymentDate: string;
  payPeriod?: string;
  overtimeHours?: number;
  contractualHours?: number;
}

export const generatePayslipPDF = (data: PayslipData) => {
  const doc = new jsPDF();

  // Add company header
  doc.setFontSize(18);
  doc.text('TeamPulse Ltd', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Payslip', 105, 30, { align: 'center' });
  doc.text(`Payment Date: ${data.paymentDate}`, 105, 38, { align: 'center' });
  
  // Add employee info
  doc.setFontSize(11);
  doc.text(`Employee: ${data.name}`, 20, 50);
  doc.text(`Job Title: ${data.title}`, 20, 58);
  doc.text(`Department: ${data.department}`, 20, 66);
  
  // Add payment period if available
  if (data.payPeriod) {
    doc.text(`Pay Period: ${data.payPeriod}`, 130, 50);
  } else {
    doc.text(`Pay Period: ${format(new Date(), 'MMMM yyyy')}`, 130, 50);
  }
  
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  doc.text(`Generated on: ${formattedDate}`, 130, 66);
  
  // Payment details table
  const paymentBody = [];
  
  // Base salary
  paymentBody.push(['Base Salary', data.salary]);
  
  // Add overtime if available
  if (data.overtimeHours && data.overtimeHours > 0) {
    const baseSalaryValue = parseInt(data.salary.replace(/[^0-9]/g, ''), 10);
    const hourlyRate = data.contractualHours ? (baseSalaryValue / data.contractualHours) : (baseSalaryValue / 160); 
    const overtimeAmount = Math.round(hourlyRate * 1.5 * data.overtimeHours);
    paymentBody.push(['Overtime', `$${overtimeAmount.toLocaleString()}`]);
    
    // Calculate total
    const total = baseSalaryValue + overtimeAmount;
    paymentBody.push(['Total', `$${total.toLocaleString()}`]);
  }
  
  autoTable(doc, {
    head: [['Payment Detail', 'Amount']],
    body: paymentBody,
    startY: 75,
    theme: 'grid'
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `This payslip is computer-generated and does not require signature. Page ${i} of ${pageCount}`,
      105, 
      doc.internal.pageSize.height - 10, 
      { align: 'center' }
    );
  }
  
  return doc.output('blob');
};
