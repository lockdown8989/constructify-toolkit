import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PayslipData } from '@/types/supabase/payroll';
import { format } from 'date-fns';

export async function downloadPayslip(data: PayslipData) {
  try {
    const doc = new jsPDF();
    
    // Define document properties
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let y = margin;

    // Function to add a styled text
    const addStyledText = (text: string, x: number, yPos: number, fontSize: number, fontWeight: string = 'normal', color: string = '#000') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontWeight);
      doc.setTextColor(color);
      doc.text(text, x, yPos);
    };

    // Company Header
    addStyledText('Acme Corp', pageWidth / 2, y + 5, 16, 'bold');
    addStyledText('123 Main Street, Anytown, USA', pageWidth / 2, y + 12, 10, 'normal', '#777');
    doc.line(margin, y + 15, pageWidth - margin, y + 15);
    y += 20;

    // Payslip Title
    addStyledText('Payslip', pageWidth / 2, y + 5, 14, 'bold');
    y += 10;

    // Employee and Period Information
    addStyledText(`Employee: ${data.employeeName}`, margin, y + 5, 10);
    addStyledText(`ID: ${data.employeeId}`, margin, y + 10, 10);
    addStyledText(`Department: ${data.department}`, margin, y + 15, 10);
    addStyledText(`Position: ${data.position}`, margin, y + 20, 10);
    addStyledText(`Period: ${data.period}`, pageWidth - 70, y + 5, 10);
    addStyledText(`Payment Date: ${format(new Date(data.paymentDate), 'MMMM dd, yyyy')}`, pageWidth - 70, y + 10, 10);
    y += 25;

    // Salary Details Table
    const tableData = [
      { label: 'Base Salary', amount: data.baseSalary },
      { label: 'Overtime Pay', amount: data.overtimePay },
      { label: 'Bonus', amount: data.bonus },
      { label: 'Gross Pay', amount: data.grossPay },
      { label: 'Deductions', amount: data.deductions },
      { label: 'Taxes', amount: data.taxes },
      { label: 'Net Pay', amount: data.netPay },
    ];

    let tableY = y;
    tableData.forEach((item, index) => {
      addStyledText(item.label, margin, tableY + 5, 10);
      addStyledText(`${data.currency} ${item.amount.toFixed(2)}`, pageWidth - 70, tableY + 5, 10);
      tableY += 5;
    });
    y = tableY + 10;

    // Bank Account Information
    addStyledText('Bank Account:', margin, y + 5, 10);
    addStyledText(data.bankAccount, margin + 40, y + 5, 10);
    y += 10;

    // Add notes section if available
    if (data.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Notes:", 20, y);
      y += 5;
      
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const notes = data.notes || ""; // Ensure notes is never undefined
      doc.text(notes, 20, y, { maxWidth: 170 });
    }

    // Footer
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
    addStyledText('Acme Corp - Confidential', pageWidth / 2, pageHeight - 20, 8, 'italic', '#777');

    // Save the PDF
    const filename = `Payslip_${data.employeeName}_${data.period}.pdf`;
    doc.save(filename);
  }
  catch (error) {
    console.error("Error generating payslip:", error);
    throw error;
  }
}
