
import type { NotificationData } from '@/models/notification';
import type { NotificationResult } from '@/models/notification';
import { sendNotification, sendNotificationToMany } from './notification-sender';
import { getManagerUserIds } from './role-utils';

/**
 * Creates a leave request notification for an employee
 */
export const createLeaveRequestNotification = async (
  userId: string, 
  leaveId: string, 
  start: string, 
  end: string, 
  type: string
): Promise<NotificationResult> => {
  console.log('NotificationService: Creating leave request notification for user:', userId);
  
  try {
    const notificationData: NotificationData = {
      user_id: userId,
      title: 'Leave Request Submitted',
      message: `Your ${type} request for ${start} to ${end} has been submitted successfully and is pending approval.`,
      type: 'success',
      related_entity: 'leave_request',
      related_id: leaveId
    };
    
    await sendNotification(notificationData);
    
    console.log('NotificationService: Leave request notification created successfully');
    return {
      success: true,
      message: 'Leave request notification created successfully'
    };
  } catch (error) {
    console.error('Error creating leave request notification:', error);
    return {
      success: false,
      message: `Error: ${error}`
    };
  }
};

/**
 * Notifies managers about a new leave request
 */
export const notifyManagersAboutLeaveRequest = async (
  leaveId: string, 
  employeeName: string, 
  start: string, 
  end: string, 
  type: string
): Promise<boolean> => {
  console.log('NotificationService: Notifying managers about new leave request');
  
  try {
    // Get all manager user IDs
    const managerIds = await getManagerUserIds();
    
    if (managerIds.length === 0) {
      console.log('NotificationService: No managers found to notify');
      return false;
    }
    
    // Create notification data for managers
    const notificationData: Omit<NotificationData, 'user_id'> = {
      title: 'New Leave Request',
      message: `${employeeName} has requested ${type} leave from ${start} to ${end}.`,
      type: 'info',
      related_entity: 'leave_request',
      related_id: leaveId
    };
    
    // Send notifications to all managers
    await sendNotificationToMany(managerIds, notificationData);
    
    console.log('NotificationService: Managers notified successfully');
    return true;
  } catch (error) {
    console.error('Error notifying managers:', error);
    return false;
  }
};
