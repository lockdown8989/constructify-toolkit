
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import type { Notification } from '@/hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const navigate = useNavigate();
  const { isManager, isAdmin, isHR } = useAuth();

  const getNotificationTimeAgo = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };
  
  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return '';
    
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  const handleNotificationClick = () => {
    // Mark as read first
    onClick(notification.id);
    
    // Then navigate to the appropriate page based on the notification type
    if (notification.related_entity) {
      switch (notification.related_entity) {
        case 'leave_calendar':
          // Check if user has manager access to determine the correct tab
          const hasManagerAccess = isManager || isAdmin || isHR;
          
          // For "New Leave Request" notifications, managers should go to approval dashboard to approve
          // For leave status updates, employees should go to employee tab to see their status
          if (hasManagerAccess && notification.title === 'New Leave Request') {
            navigate('/leave-management', { state: { initialView: 'approval-dashboard' } });
          } else {
            navigate('/leave-management', { state: { initialView: 'employee' } });
          }
          break;
        case 'schedules':
          navigate('/schedule');
          break;
        case 'open_shifts':
          navigate('/restaurant-schedule');
          break;
        case 'attendance':
          navigate('/attendance');
          break;
        case 'payroll':
          navigate('/payroll');
          break;
        default:
          // For other types, just mark as read without navigation
          break;
      }
    }
  };

  return (
    <div 
      className={`p-3 sm:p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${getNotificationBgColor(notification.type, notification.read)}`}
      onClick={handleNotificationClick}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm sm:text-base leading-tight mb-1 break-words">
            {notification.title}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
            {notification.message}
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {getNotificationTimeAgo(notification.created_at)}
          </span>
          {!notification.read && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
