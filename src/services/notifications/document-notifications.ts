
import { sendNotification } from './notification-sender';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a notification to an employee about a document upload
 */
export const sendDocumentUploadNotification = async (
  employeeId: string,
  documentType: string,
  documentName: string
): Promise<boolean> => {
  try {
    // Get employee user_id from employee record
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();
    
    if (employeeError || !employee?.user_id) {
      console.error('Error getting employee user_id:', employeeError);
      return false;
    }

    // Format document type for display
    const formattedDocType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
    
    // Send the notification
    const success = await sendNotification({
      user_id: employee.user_id,
      title: `New ${formattedDocType} Uploaded`,
      message: `A new ${documentType.toLowerCase()} document (${documentName}) has been uploaded to your profile.`,
      type: 'info',
      related_entity: 'documents',
      related_id: employeeId
    });
    
    return success;
  } catch (error) {
    console.error('Error sending document notification:', error);
    return false;
  }
};

/**
 * Assigns a document to an employee
 */
export const assignDocumentToEmployee = async (
  documentId: string,
  employeeId: string,
  isRequired: boolean = false,
  dueDate?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Call the edge function to assign the document
    const { data, error } = await supabase.functions.invoke('notify-on-document-upload', {
      body: JSON.stringify({
        documentId,
        employeeId,
        isRequired,
        dueDate
      })
    });
    
    if (error) {
      console.error('Error assigning document:', error);
      return { success: false, message: `Failed to assign document: ${error.message}` };
    }
    
    return data;
  } catch (error) {
    console.error('Error calling document assignment function:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
};
