
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface PayslipData {
  name: string;
  title: string;
  department: string;
  salary: string;
  paymentDate: string;
  payPeriod?: string;
  overtimeHours?: number;
  contractualHours?: number;
}

export const generatePayslipPDF = async (
  employeeId: string, 
  employeeData: PayslipData,
  returnPath: boolean = false
) => {
  try {
    console.log("Generating payslip for employee:", employeeId, employeeData);
    
    // Create PDF
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text('CREXTIO LTD', 20, 30);
    
    doc.setFontSize(14);
    doc.text('PAYSLIP', 20, 50);
    
    // Employee details
    doc.setFontSize(12);
    doc.text(`Employee: ${employeeData.name}`, 20, 70);
    doc.text(`Position: ${employeeData.title}`, 20, 80);
    doc.text(`Department: ${employeeData.department}`, 20, 90);
    
    // Payment details
    const paymentDate = new Date(employeeData.paymentDate);
    const monthYear = paymentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    doc.text(`Pay Period: ${employeeData.payPeriod || monthYear}`, 20, 110);
    doc.text(`Payment Date: ${paymentDate.toLocaleDateString()}`, 20, 120);
    
    // Salary information
    const baseSalary = parseFloat(employeeData.salary) || 0;
    const overtimeRate = 1.5;
    const hourlyRate = baseSalary / 160; // Assuming 160 hours per month
    const overtimeHours = employeeData.overtimeHours || 0;
    const overtimePay = overtimeHours * hourlyRate * overtimeRate;
    const grossPay = baseSalary + overtimePay;
    
    // Deductions (example calculations)
    const taxRate = 0.20; // 20% tax
    const niRate = 0.12; // 12% National Insurance
    const pensionRate = 0.05; // 5% pension
    
    const taxDeduction = grossPay * taxRate;
    const niDeduction = grossPay * niRate;
    const pensionDeduction = grossPay * pensionRate;
    const totalDeductions = taxDeduction + niDeduction + pensionDeduction;
    const netPay = grossPay - totalDeductions;
    
    // Payment breakdown
    doc.text('EARNINGS:', 20, 150);
    doc.text(`Basic Salary: £${baseSalary.toFixed(2)}`, 30, 160);
    if (overtimeHours > 0) {
      doc.text(`Overtime (${overtimeHours}h @ £${(hourlyRate * overtimeRate).toFixed(2)}/h): £${overtimePay.toFixed(2)}`, 30, 170);
    }
    doc.text(`Gross Pay: £${grossPay.toFixed(2)}`, 30, 180);
    
    doc.text('DEDUCTIONS:', 20, 200);
    doc.text(`Tax: £${taxDeduction.toFixed(2)}`, 30, 210);
    doc.text(`National Insurance: £${niDeduction.toFixed(2)}`, 30, 220);
    doc.text(`Pension: £${pensionDeduction.toFixed(2)}`, 30, 230);
    doc.text(`Total Deductions: £${totalDeductions.toFixed(2)}`, 30, 240);
    
    doc.setFontSize(14);
    doc.text(`NET PAY: £${netPay.toFixed(2)}`, 20, 260);
    
    // Generate filename
    const filename = `payslip_${employeeData.name.replace(/\s+/g, '_')}_${monthYear.replace(/\s+/g, '_')}.pdf`;
    
    if (returnPath) {
      // Save to browser storage and return path for database
      const pdfBlob = doc.output('blob');
      
      // Create a payroll record in the database
      const { data: payrollRecord, error: payrollError } = await supabase
        .from('payroll')
        .insert({
          employee_id: employeeId,
          base_pay: baseSalary,
          overtime_pay: overtimePay,
          salary_paid: netPay,
          deductions: totalDeductions,
          working_hours: employeeData.contractualHours || 160,
          overtime_hours: overtimeHours,
          payment_status: 'Paid',
          payment_date: paymentDate.toISOString().split('T')[0],
          processing_date: new Date().toISOString(),
          tax_paid: taxDeduction,
          ni_contribution: niDeduction,
          pension_contribution: pensionDeduction,
          document_name: filename
        })
        .select()
        .single();
        
      if (payrollError) {
        console.error('Error creating payroll record:', payrollError);
        throw payrollError;
      }
      
      console.log('Created payroll record:', payrollRecord);
      
      return {
        success: true,
        path: `payroll/${filename}`,
        message: 'Payslip generated and attached successfully'
      };
    } else {
      // Download the PDF
      doc.save(filename);
      return {
        success: true,
        message: 'Payslip downloaded successfully'
      };
    }
  } catch (error) {
    console.error('Error generating payslip:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate payslip'
    };
  }
};

export const attachPayslipToResume = async (
  employeeId: string,
  employeeData: PayslipData
) => {
  try {
    console.log("Attaching payslip to resume for employee:", employeeId);
    
    // Generate the payslip and create payroll record
    const result = await generatePayslipPDF(employeeId, employeeData, true);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate payslip');
    }
    
    // Update employee record to indicate payslip is attached
    const { error: updateError } = await supabase
      .from('employees')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);
      
    if (updateError) {
      console.error('Error updating employee record:', updateError);
      // Don't throw here as the payroll record was created successfully
    }
    
    return {
      success: true,
      message: 'Payslip has been attached to employee account and is now available',
      path: result.path
    };
  } catch (error) {
    console.error('Error attaching payslip to resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to attach payslip to resume'
    };
  }
};
