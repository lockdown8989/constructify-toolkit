
import { createShiftNotifications, sendDueShiftNotifications } from './shift-notification-service';

class BackgroundNotificationService {
  private static instance: BackgroundNotificationService;
  private createNotificationsInterval: NodeJS.Timeout | null = null;
  private sendNotificationsInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): BackgroundNotificationService {
    if (!BackgroundNotificationService.instance) {
      BackgroundNotificationService.instance = new BackgroundNotificationService();
    }
    return BackgroundNotificationService.instance;
  }

  public start() {
    console.log('Starting background notification service...');

    // Create shift notifications every hour
    this.createNotificationsInterval = setInterval(async () => {
      try {
        await createShiftNotifications();
        console.log('Background: Shift notifications created');
      } catch (error) {
        console.error('Background: Error creating shift notifications:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    // Check for due notifications every minute
    this.sendNotificationsInterval = setInterval(async () => {
      try {
        await sendDueShiftNotifications();
        console.log('Background: Checked and sent due notifications');
      } catch (error) {
        console.error('Background: Error sending due notifications:', error);
      }
    }, 60 * 1000); // Every minute

    // Initial run
    this.createInitialNotifications();
  }

  public stop() {
    console.log('Stopping background notification service...');
    
    if (this.createNotificationsInterval) {
      clearInterval(this.createNotificationsInterval);
      this.createNotificationsInterval = null;
    }

    if (this.sendNotificationsInterval) {
      clearInterval(this.sendNotificationsInterval);
      this.sendNotificationsInterval = null;
    }
  }

  private async createInitialNotifications() {
    try {
      await createShiftNotifications();
      await sendDueShiftNotifications();
      console.log('Background: Initial notifications setup completed');
    } catch (error) {
      console.error('Background: Error in initial notifications setup:', error);
    }
  }
}

export default BackgroundNotificationService;
