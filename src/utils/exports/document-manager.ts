
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadDocument = async (file: File, folderName: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (error) {
      throw error;
    }
    
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
};

export const uploadEmployeeDocument = async (
  employeeId: string, 
  file: File, 
  documentType: string
): Promise<string | null> => {
  try {
    const folderName = `employee-${employeeId}/${documentType}`;
    const documentUrl = await uploadDocument(file, folderName);
    
    if (documentUrl) {
      // Save document reference in database
      const { error } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          document_type: documentType,
          document_url: documentUrl,
          uploaded_at: new Date().toISOString()
        });
        
      if (error) throw error;
    }
    
    return documentUrl;
  } catch (error) {
    console.error('Error uploading employee document:', error);
    return null;
  }
};

export const attachPayslipToResume = async (
  employeeId: string,
  payslipUrl: string
): Promise<boolean> => {
  try {
    // Update employee record with payslip information
    const { error } = await supabase
      .from('employee_documents')
      .insert({
        employee_id: employeeId,
        document_type: 'payslip',
        document_url: payslipUrl,
        uploaded_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error attaching payslip to resume:', error);
    return false;
  }
};

export const getEmployeeDocuments = async (employeeId: string, documentType?: string) => {
  try {
    let query = supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId);
      
    if (documentType) {
      query = query.eq('document_type', documentType);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching employee documents:', error);
    throw error;
  }
};
