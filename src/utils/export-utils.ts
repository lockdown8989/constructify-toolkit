/**
 * Utility functions for exporting data
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Converts data to CSV format and triggers a download
 * @param data Array of objects to convert to CSV
 * @param filename Name for the downloaded file
 * @param headers Optional custom headers (if not provided, will use object keys)
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { [key in keyof T]?: string }
) {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Get all keys from the first object
  const keys = Object.keys(data[0]) as Array<keyof T>;
  
  // Create header row using provided headers or object keys
  const headerRow = keys.map(key => headers?.[key] || String(key)).join(',');
  
  // Create data rows
  const rows = data.map(item => 
    keys.map(key => {
      // Handle values that might need escaping (commas, quotes, etc.)
      const value = item[key];
      const stringValue = value === null || value === undefined ? '' : String(value);
      
      // If value contains commas, quotes, or newlines, wrap in quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  // Combine header and data rows
  const csvContent = [headerRow, ...rows].join('\n');
  
  // Create a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a formatted payslip PDF for an employee
 * @param employeeId Employee ID
 * @param employeeData Employee data to include in the payslip
 * @param uploadToStorage Whether to upload the payslip to storage
 */
export async function generatePayslipPDF(
  employeeId: string,
  employeeData: {
    name: string;
    title: string;
    salary: string;
    department?: string;
    paymentDate?: string;
  },
  uploadToStorage: boolean = false
) {
  const { name, title, salary, department, paymentDate } = employeeData;
  
  // Clean the salary string (removing $ and commas)
  const salaryNumeric = parseFloat(salary.replace(/\$|,/g, ''));
  
  // Calculate deductions
  const taxDeduction = salaryNumeric * 0.2;
  const insuranceDeduction = salaryNumeric * 0.05;
  const netSalary = salaryNumeric - taxDeduction - insuranceDeduction;
  
  // Format date
  const formattedDate = paymentDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create PDF
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("PAYSLIP", 105, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Payment Date: ${formattedDate}`, 20, 30);
  
  // Add employee info
  doc.setFontSize(12);
  doc.text("Employee Information", 20, 40);
  
  const employeeInfo = [
    ["Employee Name:", name],
    ["Employee ID:", employeeId],
    ["Position:", title],
    ["Department:", department || "N/A"],
  ];
  
  // First table - Employee Info
  autoTable(doc, {
    startY: 45,
    head: [],
    body: employeeInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 0: { cellWidth: 40 } }
  });
  
  // Get the final Y position from jsPDF's internal state
  const finalY = (doc as any).lastAutoTable.finalY;
  
  // Add salary details - Using the finalY from the previous table
  const salaryStartY = finalY + 10;
  doc.text("Salary Details", 20, salaryStartY);
  
  const salaryDetails = [
    ["Gross Salary:", `$${salaryNumeric.toLocaleString()}`],
    ["Tax Deduction (20%):", `$${taxDeduction.toLocaleString()}`],
    ["Insurance (5%):", `$${insuranceDeduction.toLocaleString()}`],
    ["Net Salary:", `$${netSalary.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: salaryStartY + 5,
    head: [],
    body: salaryDetails,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 0: { cellWidth: 40 } }
  });
  
  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("This is an electronically generated document and does not require a signature.", 105, pageHeight - 10, { align: 'center' });
  
  // Generate filename
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const period = paymentDate ? paymentDate.replace(/[^a-z0-9]/gi, '_').toLowerCase() : new Date().toISOString().split('T')[0];
  const filename = `payslip_${sanitizedName}_${period}`;
  
  // If requested, upload to Supabase storage
  if (uploadToStorage) {
    try {
      // Convert the PDF to a Blob
      const pdfOutput = doc.output('blob');
      
      // Upload to Supabase storage - "resume" bucket 
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`payslips/${employeeId}/${filename}.pdf`, pdfOutput, {
          contentType: 'application/pdf',
          upsert: true
        });
        
      if (error) {
        console.error('Error uploading payslip:', error);
        return { success: false, error: error.message, localFile: filename };
      }
      
      // Update payroll record in Supabase database
      const { error: updateError } = await supabase
        .from('payroll')
        .update({ 
          document_url: data?.path,
          document_name: `${filename}.pdf`
        })
        .eq('employee_id', employeeId)
        .eq('payment_date', new Date(formattedDate).toISOString().split('T')[0]);
        
      if (updateError) {
        console.error('Error updating payroll record:', updateError);
      }
      
      return { success: true, path: data?.path, filename: `${filename}.pdf` };
    } catch (error) {
      console.error('Exception during payslip upload:', error);
      return { success: false, error: String(error), localFile: filename };
    }
  }
  
  // Save PDF locally
  doc.save(`${filename}.pdf`);
  return { success: true, localFile: filename };
}

/**
 * Generates a formatted payslip CSV for an employee
 * @param employeeId Employee ID
 * @param employeeData Employee data to include in the payslip
 */
export async function generatePayslipCSV(
  employeeId: string,
  employeeData: {
    name: string;
    title: string;
    salary: string;
    department?: string;
    paymentDate?: string;
  }
) {
  const { name, title, salary, department, paymentDate } = employeeData;
  
  // Clean the salary string (removing $ and commas)
  const salaryNumeric = parseFloat(salary.replace(/\$|,/g, ''));
  
  // Calculate deductions
  const taxDeduction = salaryNumeric * 0.2;
  const insuranceDeduction = salaryNumeric * 0.05;
  const netSalary = salaryNumeric - taxDeduction - insuranceDeduction;
  
  // Format date
  const formattedDate = paymentDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create payslip data
  const payslipData = [
    {
      'Employee': name,
      'Employee ID': employeeId,
      'Position': title,
      'Department': department || 'N/A',
      'Payment Date': formattedDate,
      'Gross Salary': `$${salaryNumeric.toLocaleString()}`,
      'Tax Deduction (20%)': `$${taxDeduction.toLocaleString()}`,
      'Insurance (5%)': `$${insuranceDeduction.toLocaleString()}`,
      'Net Salary': `$${netSalary.toLocaleString()}`,
    }
  ];
  
  // Generate filename
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const period = paymentDate ? paymentDate.replace(/[^a-z0-9]/gi, '_').toLowerCase() : new Date().toISOString().split('T')[0];
  const filename = `payslip_${sanitizedName}_${period}`;
  
  // Export to CSV
  exportToCSV(payslipData, filename, {
    'Employee': 'Employee Name',
    'Employee ID': 'Employee ID',
    'Position': 'Job Title',
    'Department': 'Department',
    'Payment Date': 'Payment Date',
    'Gross Salary': 'Gross Salary',
    'Tax Deduction (20%)': 'Tax Deduction (20%)',
    'Insurance (5%)': 'Insurance (5%)',
    'Net Salary': 'Net Salary'
  });
}

/**
 * Uploads a document to an employee's record
 * @param employeeId Employee ID
 * @param file File to upload
 * @param documentType Type of document (e.g., 'resume', 'contract')
 */
export async function uploadEmployeeDocument(
  employeeId: string,
  file: File,
  documentType: 'resume' | 'contract' | 'payslip'
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const filename = `${documentType}_${timestamp}.${fileExtension}`;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`employees/${employeeId}/${documentType}/${filename}`, file, {
        contentType: file.type,
        upsert: true
      });
      
    if (error) {
      console.error(`Error uploading ${documentType}:`, error);
      return { success: false, error: error.message };
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(`employees/${employeeId}/${documentType}/${filename}`);
    
    // Update employee record with document reference
    const updateField = documentType === 'resume' 
      ? { resume_url: data.path } 
      : documentType === 'contract' 
        ? { contract_url: data.path }
        : {};
    
    if (Object.keys(updateField).length > 0) {
      const { error: updateError } = await supabase
        .from('employees')
        .update(updateField)
        .eq('id', employeeId);
        
      if (updateError) {
        console.error(`Error updating employee ${documentType} record:`, updateError);
      }
    }
    
    return { success: true, path: urlData.publicUrl };
  } catch (error) {
    console.error(`Exception during ${documentType} upload:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Attaches a payslip to an employee's resume
 * @param employeeId Employee ID
 * @param payslipData Payslip data to include
 */
export async function attachPayslipToResume(
  employeeId: string,
  payslipData: {
    name: string;
    title: string;
    salary: string; 
    department?: string;
    paymentDate?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    // First check if the employee has a resume in the documents bucket
    const { data: documents, error: documentsError } = await supabase.storage
      .from('documents')
      .list(`employees/${employeeId}/resume`);
      
    if (documentsError || !documents || documents.length === 0) {
      // No resume found, just create and store the payslip
      const result = await generatePayslipPDF(employeeId, payslipData, true);
      return {
        success: result.success,
        message: result.success 
          ? 'Created new payslip document' 
          : `Failed to create payslip: ${result.error}`
      };
    }
    
    // Employee has a resume, generate the payslip
    const payslipResult = await generatePayslipPDF(employeeId, payslipData, true);
    
    if (!payslipResult.success) {
      return {
        success: false,
        message: `Failed to generate payslip: ${payslipResult.error}`
      };
    }
    
    // Update employee document record with the payslip reference
    await supabase
      .from('documents')
      .insert({
        employee_id: employeeId,
        document_type: 'payslip',
        name: payslipResult.filename || `Payslip_${new Date().toISOString().split('T')[0]}`,
        path: payslipResult.path,
        size: 'auto-generated'
      });
    
    return {
      success: true,
      message: 'Payslip generated and attached to employee records'
    };
  } catch (error) {
    console.error('Error attaching payslip to resume:', error);
    return {
      success: false,
      message: String(error)
    };
  }
}
