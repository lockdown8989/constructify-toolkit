
import { supabase } from '@/integrations/supabase/client';
import { generatePayslipPDF, PayslipResult } from './payslip-generator'; 
import { notifyEmployeeAboutDocument } from '@/services/notifications/payroll-notifications';
import { sendDocumentUploadNotification } from '@/services/notifications/document-notifications';

export async function uploadEmployeeDocument(
  employeeId: string,
  file: File,
  documentType: 'resume' | 'contract' | 'payslip'
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
  try {
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const filename = `${documentType}_${timestamp}.${fileExtension}`;
    
    // Check if documents bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return {
        success: false,
        error: `Failed to check storage buckets: ${bucketsError.message}`
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
          error: `Failed to create storage bucket: ${createError.message}`
        };
      }
    }
    
    // Upload file to Supabase storage
    const filePath = `employees/${employeeId}/${documentType}/${filename}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
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
      .getPublicUrl(filePath);
    
    // Update documents table with document reference
    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      .insert({
        employee_id: employeeId,
        document_type: documentType,
        name: file.name,
        path: filePath,
        url: urlData.publicUrl,
        size: `${Math.round(file.size / 1024)} KB`,
        file_type: file.type
      })
      .select()
      .single();
      
    if (insertError) {
      console.error(`Error updating document record:`, insertError);
      return { success: false, error: insertError.message };
    }

    // Get employee user_id for notification
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();
      
    // Send notification to employee about new document
    if (employee?.user_id && (documentType === 'contract' || documentType === 'payslip')) {
      await sendDocumentUploadNotification(
        employeeId,
        documentType,
        file.name,
        urlData.publicUrl
      );
    }
    
    return { success: true, path: filePath, url: urlData.publicUrl };
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
): Promise<{ success: boolean; message: string; documentUrl?: string }> {
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
    
    // Get employee user_id for notification
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
    
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
        message: `Failed to generate payslip: ${payslipResult.error || "Unknown error"}`
      };
    }
    
    console.log("Payslip generated successfully, path:", payslipResult.path);
    
    if (!payslipResult.path) {
      return {
        success: false,
        message: "Payslip generated but path is missing"
      };
    }
    
    // Get the public URL if it wasn't returned directly
    let publicUrl = payslipResult.url;
    if (!publicUrl && payslipResult.path) {
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(payslipResult.path);
        
      publicUrl = urlData.publicUrl;
    }
    
    // Add the payslip as a document in the documents table
    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      .insert({
        employee_id: employeeId,
        document_type: 'payslip',
        name: payslipResult.filename || `Payslip_${new Date().toISOString().split('T')[0]}`,
        path: payslipResult.path,
        url: publicUrl,
        size: 'auto-generated'
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error inserting payslip document record:', insertError);
      return {
        success: false,
        message: `Payslip generated but failed to attach to records: ${insertError.message}`
      };
    }
    
    // Send notification to employee about new payslip document
    if (employee?.user_id) {
      await sendDocumentUploadNotification(
        employeeId,
        'payslip',
        payslipResult.filename || `Payslip_${new Date().toISOString().split('T')[0]}`,
        publicUrl
      );
    }
    
    // Determine message based on whether there was a resume
    const successMessage = documents && documents.length > 0
      ? 'Payslip generated, attached to employee records, and employee notified'
      : 'Payslip generated, added to employee documents, and employee notified';
    
    return {
      success: true,
      message: successMessage,
      documentUrl: publicUrl
    };
  } catch (error) {
    console.error('Error attaching payslip to resume:', error);
    return {
      success: false,
      message: `Unexpected error: ${String(error)}`
    };
  }
}
