
import { supabase } from '@/integrations/supabase/client';
import { generatePayslipPDF } from './payslip-generator'; // Import the function

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
    
    // Update documents table with document reference
    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        employee_id: employeeId,
        document_type: documentType,
        name: file.name,
        path: data.path,
        size: `${Math.round(file.size / 1024)} kb`
      });
      
    if (insertError) {
      console.error(`Error updating document record:`, insertError);
    }
    
    return { success: true, path: urlData.publicUrl };
  } catch (error) {
    console.error(`Exception during ${documentType} upload:`, error);
    return { success: false, error: String(error) };
  }
}

export async function attachPayslipToResume(
  employeeId: string,
  employeeData: {
    name: string;
    title: string;
    salary: string;
    department?: string;
    paymentDate?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Starting attachPayslipToResume with employee ID:", employeeId);
    
    // Check if documents bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return {
        success: false,
        message: `Failed to check storage buckets: ${bucketsError.message}`
      };
    }
    
    const documentsBucket = buckets.find(b => b.name === 'documents');
    
    if (!documentsBucket) {
      console.log('Documents bucket not found. Creating it now...');
      const { error: createError } = await supabase.storage.createBucket('documents', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Error creating documents bucket:', createError);
        return {
          success: false,
          message: `Failed to create storage bucket: ${createError.message}`
        };
      }
    }
    
    // First check if the employee has a resume in the documents bucket
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('document_type', 'resume');
      
    if (documentsError) {
      console.error('Error fetching resume document:', documentsError);
      return {
        success: false,
        message: `Failed to check for resume: ${documentsError.message}`
      };
    }
    
    console.log("Resume documents found:", documents?.length || 0);
    
    // Generate the payslip
    const payslipResult = await generatePayslipPDF(employeeId, employeeData, true);
    
    if (!payslipResult.success) {
      return {
        success: false,
        message: `Failed to generate payslip: ${payslipResult.error}`
      };
    }
    
    console.log("Payslip generated successfully, path:", payslipResult.path);
    
    if (!payslipResult.path) {
      return {
        success: false,
        message: "Payslip generated but path is missing"
      };
    }
    
    // Add the payslip as a document in the documents table
    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        employee_id: employeeId,
        document_type: 'payslip',
        name: payslipResult.filename || `Payslip_${new Date().toISOString().split('T')[0]}`,
        path: payslipResult.path,
        size: 'auto-generated'
      });
      
    if (insertError) {
      console.error('Error inserting payslip document record:', insertError);
      return {
        success: false,
        message: `Payslip generated but failed to attach to records: ${insertError.message}`
      };
    }
    
    // Determine message based on whether there was a resume
    const successMessage = documents && documents.length > 0
      ? 'Payslip generated and attached to employee resume'
      : 'Payslip generated and added to employee documents';
    
    return {
      success: true,
      message: successMessage
    };
  } catch (error) {
    console.error('Error attaching payslip to resume:', error);
    return {
      success: false,
      message: `Unexpected error: ${String(error)}`
    };
  }
}
