
import { sendNotification } from './notification-sender';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a notification to an employee about a document upload
 */
export const sendDocumentUploadNotification = async (
  employeeId: string,
  documentType: string,
  documentName: string,
  documentUrl?: string
): Promise<boolean> => {
  try {
    console.log(`Sending document notification to employee ${employeeId} for ${documentType}`);
    
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
      title: `New ${formattedDocType} Document Available`,
      message: `A new ${documentType.toLowerCase()} document (${documentName}) is now available in your documents section.${documentUrl ? ' Click to view or download.' : ''}`,
      type: 'info',
      related_entity: 'documents',
      related_id: employeeId,
      action_url: documentUrl  // This ensures the URL is included in the notification
    });
    
    console.log(`Notification ${success ? 'sent successfully' : 'failed'} to employee ${employee.name} with document URL: ${documentUrl || 'none'}`);
    return success;
  } catch (error) {
    console.error('Error sending document notification:', error);
    return false;
  }
};

/**
 * Assigns a document to an employee and sends notification
 */
export const assignDocumentToEmployee = async (
  documentId: string,
  employeeId: string,
  isRequired: boolean = false,
  dueDate?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log(`Assigning document ${documentId} to employee ${employeeId}`);
    
    // Get the document details first
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
      
    if (docError || !document) {
      console.error('Error getting document:', docError);
      return { success: false, message: `Failed to get document details: ${docError?.message}` };
    }
    
    // Create assignment record
    const { data: assignment, error: assignError } = await supabase
      .from('document_assignments')
      .insert({
        document_id: documentId,
        employee_id: employeeId,
        assigned_at: new Date().toISOString(),
        is_required: isRequired,
        due_date: dueDate,
        status: 'pending'
      })
      .select('id')
      .single();
      
    if (assignError) {
      console.error('Error creating document assignment:', assignError);
      return { success: false, message: `Failed to assign document: ${assignError.message}` };
    }
    
    console.log('Document assigned, sending notification with URL:', document.url);
    
    // Make sure document has a URL
    let documentUrl = document.url;
    if (!documentUrl && document.path) {
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(document.path);
        
      documentUrl = urlData.publicUrl;
      
      // Update document with URL if it was missing
      if (documentUrl) {
        await supabase
          .from('documents')
          .update({ url: documentUrl })
          .eq('id', documentId);
      }
    }
    
    // Send notification to employee
    await sendDocumentUploadNotification(
      employeeId,
      document.document_type,
      document.name,
      documentUrl
    );
    
    return { 
      success: true, 
      message: "Document assigned and employee notified", 
      data: { assignmentId: assignment?.id }
    };
  } catch (error: any) {
    console.error('Error calling document assignment function:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
};
