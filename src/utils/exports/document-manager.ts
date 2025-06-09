
import { supabase } from '@/integrations/supabase/client';
import { generatePayslipPDF } from './payslip-generator';

interface DocumentAssignmentRequest {
  employeeId: string;
  documentType: string;
  documentName: string;
  documentPath: string;
}

interface DocumentUploadResult {
  success: boolean;
  message: string;
  error?: string;
  path?: string;
}

export const uploadEmployeeDocument = async (
  file: File,
  employeeId: string,
  documentType: string
): Promise<DocumentUploadResult> => {
  try {
    // Validate input
    if (!file || !employeeId || !documentType) {
      return {
        success: false,
        message: 'Missing required information for document upload',
        error: 'Invalid input parameters'
      };
    }

    // Create folder path for employee documents
    const folderPath = `${employeeId}/${documentType}`;
    const filePath = `${folderPath}/${file.name}`;

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        message: 'Failed to upload document',
        error: error.message
      };
    }

    // Add entry to documents table
    const { error: docError } = await supabase
      .from('documents')
      .insert({
        employee_id: employeeId,
        document_type: documentType,
        name: file.name,
        path: filePath,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });

    if (docError) {
      console.error('Error adding document record:', docError);
      return {
        success: false,
        message: 'Document uploaded but failed to update database',
        error: docError.message,
        path: filePath
      };
    }

    return {
      success: true,
      message: 'Document uploaded successfully',
      path: filePath
    };
  } catch (error) {
    console.error('Exception during document upload:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: String(error)
    };
  }
};

export const attachPayslipToResume = async (
  employeeId: string,
  employeeData: any
): Promise<DocumentUploadResult> => {
  try {
    // Generate the payslip PDF
    const result = await generatePayslipPDF(employeeId, employeeData, true);

    if (!result.success) {
      return {
        success: false,
        message: 'Failed to generate payslip',
        error: result.error
      };
    }

    if (!result.path) {
      return {
        success: false,
        message: 'Payslip generated but path is missing',
        error: 'Invalid payslip path'
      };
    }

    // Update employee record to link payslip to resume
    const { error } = await supabase
      .from('employees')
      .update({
        payslip_attached: true,
        payslip_path: result.path,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) {
      console.error('Error updating employee record:', error);
      return {
        success: false,
        message: 'Payslip generated but failed to attach to resume',
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Payslip has been attached to your resume',
      path: result.path
    };
  } catch (error) {
    console.error('Exception attaching payslip to resume:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: String(error)
    };
  }
};
