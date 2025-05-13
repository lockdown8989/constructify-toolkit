import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';

interface PayslipData {
  name: string;
  title: string;
  salary: string;
  department?: string;
  paymentDate?: string;
  currency?: string;
  employeeId?: string;
  taxCode?: string;
  niNumber?: string;
  address?: string;
  payPeriod?: string;
  employer?: string;
  employerAddress?: string;
  payGroup?: string;
  payFrequency?: string;
  overtimeHours?: number;
  contractualHours?: number;
}

export interface PayslipResult {
  success: boolean;
  error?: string;
  localFile?: string;
  path?: string;
  filename?: string;
  url?: string; // Adding the url property that's being used
}

export async function generatePayslipPDF(
  employeeId: string,
  employeeData: PayslipData,
  uploadToStorage: boolean = false
): Promise<PayslipResult> {
  try {
    const { 
      name, 
      title, 
      salary, 
      department, 
      paymentDate, 
      currency = 'GBP',
      taxCode = '1257L',
      niNumber = '',
      address = '',
      payPeriod = '',
      employer = 'COMPANY LTD',
      employerAddress = '',
      payGroup = '001M',
      payFrequency = 'Monthly',
      overtimeHours = 0,
      contractualHours = 0
    } = employeeData;
    
    // Clean the salary string (removing $ and commas)
    const salaryNumeric = parseFloat(salary.replace(/\$|£|,/g, ''));
    
    // Calculate deductions
    const taxRate = 0.2;
    const niRate = 0.12;
    const otherRate = 0.08;
    
    const taxDeduction = salaryNumeric * taxRate;
    const niContribution = salaryNumeric * niRate;
    const otherDeductions = salaryNumeric * otherRate;
    const totalDeductions = taxDeduction + niContribution + otherDeductions;
    const netSalary = salaryNumeric - totalDeductions;
    
    // Calculate overtime
    const hourlyRate = salaryNumeric / 160; // Assuming 160 working hours per month
    const overtimeRate = hourlyRate * 1.5;
    const overtimePay = overtimeHours * overtimeRate;
    
    // Format date
    const currentDate = new Date();
    const formattedPayDate = paymentDate || format(currentDate, 'dd/MM/yyyy');
    const periodStart = format(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1), 'dd/MM/yyyy');
    const periodEnd = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 0), 'dd/MM/yyyy');
    const formattedPayPeriod = payPeriod || `${periodStart} - ${periodEnd}`;
    
    // Currency symbol for display
    const currencySymbol = currency === 'GBP' ? '£' : 
                          currency === 'EUR' ? '€' : '$';
    
    const formatAmount = (amount: number) => {
      return `${currencySymbol}${amount.toFixed(2)}`;
    };
    
    // Create PDF
    const doc = new jsPDF();
    
    // Set background to white
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    
    // Add header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
    
    // Add employee name and pay period
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(name.toUpperCase(), 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Pay Period: ${formattedPayPeriod}`, 20, 40);
    
    // Employee details - left column
    doc.setFontSize(10);
    doc.text(`Employee Number: ${employeeId}`, 20, 55);
    doc.text(`Tax Code: ${taxCode}`, 20, 65);
    doc.text(`Payment Method: BACS/FPAY`, 20, 75);
    doc.text(`NI Number: ${niNumber}`, 20, 85);
    
    // Middle column
    doc.text(`NI Code: A`, 110, 55);
    doc.text(`Pay Group: ${payGroup}`, 110, 65);
    doc.text(`Tax Period: ${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`, 110, 75);
    doc.text(`Employee Address: ${address}`, 110, 85);
    
    // Right column
    doc.text(`Employer: ${employer}`, 170, 55);
    doc.text(`Pay Date: ${formattedPayDate}`, 170, 65);
    doc.text(`Pay Frequency: ${payFrequency}`, 170, 75);
    doc.text(`Employer Address: ${employerAddress}`, 170, 85);
    
    // Payment summary boxes
    const boxY = 105;
    const boxHeight = 35;
    
    // Gross Pay Box
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(20, boxY, 50, boxHeight);
    doc.text("Gross Pay", 30, boxY + 10);
    doc.setFontSize(14);
    doc.text(formatAmount(salaryNumeric), 30, boxY + 20);
    doc.setFontSize(8);
    doc.text(`YTD ${formatAmount(salaryNumeric)}`, 30, boxY + 30);
    
    // Tax Box
    doc.rect(71, boxY, 50, boxHeight);
    doc.setFontSize(10);
    doc.text("PAYE Tax", 81, boxY + 10);
    doc.setFontSize(14);
    doc.text(formatAmount(taxDeduction), 81, boxY + 20);
    doc.setFontSize(8);
    doc.text(`YTD ${formatAmount(taxDeduction)}`, 81, boxY + 30);
    
    // NI Box
    doc.rect(122, boxY, 50, boxHeight);
    doc.setFontSize(10);
    doc.text("NIC", 132, boxY + 10);
    doc.setFontSize(14);
    doc.text(formatAmount(niContribution), 132, boxY + 20);
    doc.setFontSize(8);
    doc.text(`YTD ${formatAmount(niContribution)}`, 132, boxY + 30);
    
    // Others Box
    doc.rect(173, boxY, 50, boxHeight);
    doc.setFontSize(10);
    doc.text("Others", 183, boxY + 10);
    doc.setFontSize(14);
    doc.text(formatAmount(otherDeductions), 183, boxY + 20);
    doc.setFontSize(8);
    doc.text(`YTD ${formatAmount(otherDeductions)}`, 183, boxY + 30);
    
    // Net Pay Box
    doc.setLineWidth(1);
    doc.rect(224, boxY, 50, boxHeight);
    doc.setFontSize(10);
    doc.text("Net Pay", 234, boxY + 10);
    doc.setFontSize(14);
    doc.text(formatAmount(netSalary), 234, boxY + 20);
    doc.setFontSize(8);
    doc.text(`YTD ${formatAmount(netSalary)}`, 234, boxY + 30);
    
    // Payments and Deductions tables
    const tableY = boxY + boxHeight + 20;
    
    // Add section title
    doc.setLineWidth(0.5);
    doc.setFontSize(11);
    doc.text("PAYMENTS - ", 20, tableY - 10);
    doc.text(`Employee ID: ${employeeId}`, 80, tableY - 10);
    
    // Payments table
    const paymentsData = [
      ['Description', 'Units', 'Rate', 'Amount'],
      ['Salary', '-', '-', formatAmount(salaryNumeric - overtimePay)],
      ['Overtime @ 1.5', `${overtimeHours}`, `${formatAmount(overtimeRate)}`, formatAmount(overtimePay)]
    ];
    
    autoTable(doc, {
      startY: tableY,
      head: [paymentsData[0]],
      body: paymentsData.slice(1),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Add total row
    const firstTableEndY = (doc as any).lastAutoTable.finalY;
    doc.text('Total', 150, firstTableEndY + 10);
    doc.text(formatAmount(salaryNumeric), 180, firstTableEndY + 10, { align: 'right' });
    
    // Deductions table
    doc.text("DEDUCTIONS - ", 20, firstTableEndY + 25);
    doc.text(`Employee ID: ${employeeId}`, 80, firstTableEndY + 25);
    
    const deductionsData = [
      ['Description', 'Amount'],
      ['Tax Paid', formatAmount(taxDeduction)],
      ['NI Contribution', formatAmount(niContribution)],
      ['Other Deductions', formatAmount(otherDeductions)]
    ];
    
    autoTable(doc, {
      startY: firstTableEndY + 30,
      head: [deductionsData[0]],
      body: deductionsData.slice(1),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 30, halign: 'right' }
      }
    });
    
    const secondTableEndY = (doc as any).lastAutoTable.finalY;
    doc.text('Total', 150, secondTableEndY + 10);
    doc.text(formatAmount(totalDeductions), 180, secondTableEndY + 10, { align: 'right' });
    
    // Year-to-date section
    doc.text("CUMULATIVE YEAR TO DATE", 20, secondTableEndY + 30);
    
    const ytdData = [
      ['Description', 'Amount'],
      ['Total Gross Payments', formatAmount(salaryNumeric)],
      ['Taxable Gross', formatAmount(salaryNumeric)],
      ['Tax Paid', formatAmount(taxDeduction)],
      ['NI Contribution', formatAmount(niContribution)],
      ['Net Pay', formatAmount(netSalary)]
    ];
    
    autoTable(doc, {
      startY: secondTableEndY + 35,
      body: ytdData,
      theme: 'plain',
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This is an electronically generated document and does not require a signature.", 105, pageHeight - 10, { align: 'center' });
    
    // Generate filename
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const period = formattedPayPeriod.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `payslip_${sanitizedName}_${period}`;
    
    if (uploadToStorage) {
      return await uploadPayslipToStorage(doc, filename, employeeId, formattedPayDate, currency);
    }
    
    // Save PDF locally
    doc.save(`${filename}.pdf`);
    return { success: true, localFile: filename };
  } catch (error) {
    console.error('Error in generatePayslipPDF:', error);
    return { success: false, error: String(error) };
  }
}

async function uploadPayslipToStorage(
  doc: jsPDF,
  filename: string,
  employeeId: string,
  formattedDate: string,
  currency: string = 'GBP'
): Promise<PayslipResult> {
  try {
    // Check if documents bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return { success: false, error: `Bucket error: ${bucketsError.message}`, localFile: filename };
    }
    
    const documentsBucket = buckets.find(b => b.name === 'documents');
    
    if (!documentsBucket) {
      console.error('Documents bucket not found. Creating it now...');
      const { error: createError } = await supabase.storage.createBucket('documents', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Error creating documents bucket:', createError);
        return { success: false, error: `Failed to create storage bucket: ${createError.message}`, localFile: filename };
      }
    }
    
    // Convert the PDF to a Blob
    const pdfOutput = doc.output('blob');
    
    // Create the folder path if it doesn't exist
    const folderPath = `payslips/${employeeId}`;
    const filePath = `${folderPath}/${filename}.pdf`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfOutput, {
        contentType: 'application/pdf',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading payslip:', error);
      return { success: false, error: error.message, localFile: filename };
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
    
    // Update payroll record in Supabase database
    const { error: updateError } = await supabase
      .from('payroll')
      .update({ 
        document_url: filePath,
        document_name: `${filename}.pdf`
      })
      .eq('employee_id', employeeId)
      .eq('payment_date', new Date(formattedDate).toISOString().split('T')[0]);
      
    if (updateError) {
      console.error('Error updating payroll record:', updateError);
    }
    
    // Add entry to documents table
    const { error: docError } = await supabase
      .from('documents')
      .insert({
        employee_id: employeeId,
        document_type: 'payslip',
        name: `Payslip - ${formattedDate} (${currency})`,
        path: filePath,
        url: publicUrl,
        size: 'auto-generated'
      });
    
    if (docError) {
      console.error('Error adding document record:', docError);
    }
    
    return { success: true, path: filePath, filename: `${filename}.pdf`, url: publicUrl };
  } catch (error) {
    console.error('Exception during payslip upload:', error);
    return { success: false, error: String(error), localFile: filename };
  }
}
