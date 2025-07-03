
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from './notification-sender';

export const notifyDocumentUpload = async (
  employeeId: string,
  documentName: string,
  uploadedBy: string
) => {
  try {
    // Get the employee's user_id
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('user_id, name')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee?.user_id) {
      console.error('Error finding employee:', employeeError);
      return false;
    }

    // Send notification to the employee
    const result = await sendNotification({
      user_id: employee.user_id,
      title: '📄 New Document Uploaded',
      message: `A new document "${documentName}" has been uploaded to your profile by ${uploadedBy}.`,
      type: 'info',
      related_entity: 'documents',
      related_id: employeeId
    });

    // Also notify managers
    const { data: managers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr']);

    if (managers) {
      for (const manager of managers) {
        await sendNotification({
          user_id: manager.user_id,
          title: '📄 Document Uploaded',
          message: `New document "${documentName}" has been uploaded for ${employee.name}.`,
          type: 'info',
          related_entity: 'documents',
          related_id: employeeId
        });
      }
    }

    return result.success;
  } catch (error) {
    console.error('Error in document notification:', error);
    return false;
  }
};

export const notifyDocumentAssignment = async (
  employeeId: string,
  documentName: string,
  dueDate?: string
) => {
  try {
    // Get the employee's user_id
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee?.user_id) {
      console.error('Error finding employee:', employeeError);
      return false;
    }

    const message = dueDate 
      ? `Document "${documentName}" has been assigned to you. Due date: ${dueDate}.`
      : `Document "${documentName}" has been assigned to you.`;

    const result = await sendNotification({
      user_id: employee.user_id,
      title: '📋 Document Assignment',
      message,
      type: 'info',
      related_entity: 'document_assignments',
      related_id: employeeId
    });

    return result.success;
  } catch (error) {
    console.error('Error in document assignment notification:', error);
    return false;
  }
};
