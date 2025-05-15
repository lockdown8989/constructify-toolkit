
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

export const generatePayslipPDF = async (employeeId: string, month?: string) => {
  try {
    // Fetch employee data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (empError) throw new Error(`Error fetching employee: ${empError.message}`);
    if (!employee) throw new Error('Employee not found');

    // Fetch the most recent payroll record for this employee
    const { data: payrollData, error: payrollError } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', employeeId)
      .order('payment_date', { ascending: false })
      .limit(1)
      .single();

    if (payrollError && payrollError.code !== 'PGRST116') {
      // If error is not "no rows returned" error
      throw new Error(`Error fetching payroll data: ${payrollError.message}`);
    }

    // Create PDF
    const doc = new jsPDF();
    
    // Add company logo or header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128);
    doc.text('COMPANY PAYSLIP', 105, 20, { align: 'center' });
    
    // Employee information section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Employee: ${employee.name}`, 20, 40);
    doc.text(`Department: ${employee.department}`, 20, 48);
    doc.text(`Position: ${employee.job_title}`, 20, 56);
    doc.text(`Employee ID: ${employee.id.substring(0, 8)}...`, 20, 64);
    
    const currentDate = new Date();
    const payDate = payrollData?.payment_date 
      ? new Date(payrollData.payment_date) 
      : currentDate;
    
    doc.text(`Pay Date: ${payDate.toLocaleDateString()}`, 140, 40);
    
    // Payment details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 128);
    doc.text('Payment Details', 20, 80);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Create table for payment details
    const paymentData = [
      ['Description', 'Amount'],
      ['Base Salary', `$${employee.salary.toLocaleString()}`],
      ['Overtime Pay', `$${payrollData?.overtime_pay?.toLocaleString() || '0.00'}`],
      ['Bonus', `$${payrollData?.bonus?.toLocaleString() || '0.00'}`],
      ['Deductions', `-$${payrollData?.deductions?.toLocaleString() || '0.00'}`],
      ['Total Pay', `$${payrollData?.salary_paid?.toLocaleString() || employee.salary.toLocaleString()}`]
    ];
    
    (doc as any).autoTable({
      startY: 85,
      head: [paymentData[0]],
      body: paymentData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 128] },
    });
    
    // Add notes
    doc.setFontSize(11);
    doc.text('This is a computer-generated document and does not require a signature.', 20, 160);
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('© 2025 Company Name. All Rights Reserved.', 105, 280, { align: 'center' });
    
    // Save and download the PDF
    doc.save(`payslip-${employee.name.replace(/\s+/g, '-')}-${payDate.toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
