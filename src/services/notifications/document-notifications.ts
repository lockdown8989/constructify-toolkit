
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from './notification-sender';

/**
 * Notify an employee when a document is uploaded for them
 * @param employeeId - The employee ID that the document is for
 * @param documentType - The type of document that was uploaded
 * @param documentName - The name of the uploaded document
 */
export const notifyEmployeeOfDocumentUpload = async (
  employeeId: string,
  documentType: string,
  documentName: string
) => {
  try {
    // Get the user ID for this employee
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
      
    if (employeeError || !employee.user_id) {
      console.error('Could not find user ID for employee:', employeeError);
      return false;
    }
    
    // Send notification to the employee
    const result = await sendNotification({
      user_id: employee.user_id,
      title: `New ${documentType} Document`,
      message: `A new ${documentType} document (${documentName}) has been uploaded to your profile.`,
      type: 'info',
      related_entity: 'documents',
      related_id: documentName
    });
    
    return result.success;
  } catch (error) {
    console.error('Error notifying employee of document upload:', error);
    return false;
  }
};
