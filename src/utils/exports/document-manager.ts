
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { generatePayslipPDF, PayslipData } from './payslip-generator';

// Types for document operations
export interface DocumentUploadResult {
  success: boolean;
  message: string;
  path?: string;
  error?: string;
}

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  uploaded_by: string;
  size?: number;
  description?: string;
  employee_id?: string;
}

// Types for document assignments
export interface DocumentAssignment {
  id: string;
  document_id: string;
  employee_id: string;
  assigned_at: string;
  assigned_by: string;
  status: 'pending' | 'viewed' | 'signed';
  due_date?: string;
}

// Upload document to Supabase storage
export const uploadDocument = async (
  file: File,
  employeeId: string | null,
  description?: string
): Promise<DocumentUploadResult> => {
  try {
    // Create a unique file name
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = employeeId 
      ? `employees/${employeeId}/${uniqueFileName}`
      : `general/${uniqueFileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (error) {
      throw error;
    }
    
    // Create document record in database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        file_path: data.path,
        file_type: file.type,
        size: file.size,
        description: description || '',
        employee_id: employeeId,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id || 'unknown',
        created_at: new Date().toISOString()
      });
    
    if (docError) {
      throw docError;
    }
    
    return {
      success: true,
      message: 'Document uploaded successfully',
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      message: `Error uploading document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Generate and upload a payslip document
export const generatePayslipDocument = async (
  employeeData: PayslipData,
  employeeId: string
): Promise<DocumentUploadResult> => {
  try {
    // Generate PDF blob
    const pdfBlob = await generatePayslipPDF(employeeData);
    
    // Create file from blob
    const fileName = `${employeeData.name.replace(/\s/g, '_')}_payslip_${employeeData.paymentDate.replace(/\s/g, '_')}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Upload using the uploadDocument function
    return await uploadDocument(file, employeeId, `Payslip for ${employeeData.paymentDate}`);
  } catch (error) {
    console.error('Error generating payslip document:', error);
    return {
      success: false,
      message: `Error generating payslip document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get document public URL
export const getDocumentUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data } = await supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting document URL:', error);
    return null;
  }
};

// Delete document
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    // Get document info to get the file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (fetchError || !document) {
      throw new Error('Document not found');
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);
    
    if (storageError) {
      throw storageError;
    }
    
    // Delete record from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) {
      throw dbError;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};
