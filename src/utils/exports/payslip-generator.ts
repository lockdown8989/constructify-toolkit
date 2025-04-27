
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

interface PayslipData {
  name: string;
  title: string;
  salary: string;
  department?: string;
  paymentDate?: string;
}

export async function generatePayslipPDF(
  employeeId: string,
  employeeData: PayslipData,
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
  
  if (uploadToStorage) {
    return await uploadPayslipToStorage(doc, filename, employeeId, formattedDate);
  }
  
  // Save PDF locally
  doc.save(`${filename}.pdf`);
  return { success: true, localFile: filename };
}

async function uploadPayslipToStorage(
  doc: jsPDF,
  filename: string,
  employeeId: string,
  formattedDate: string
) {
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
    
    return { success: true, path: filePath, filename: `${filename}.pdf` };
  } catch (error) {
    console.error('Exception during payslip upload:', error);
    return { success: false, error: String(error), localFile: filename };
  }
}
