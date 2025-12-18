import { getFirebaseAdmin, isFirebaseInitialized } from '../config';
import { INotificationPayload } from '../types';
import { log } from '../utils';

class NotificationService {
  /**
   * Send push notification to a single device
   */
  async sendPushNotification(
    fcmToken: string,
    payload: INotificationPayload
  ): Promise<boolean> {
    if (!isFirebaseInitialized()) {
      log.debug('Firebase not initialized, skipping push notification');
      return false;
    }

    const admin = getFirebaseAdmin();
    if (!admin) {
      log.warn('Firebase admin not available');
      return false;
    }

    try {
      const message = {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'campus-fixit-updates',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      log.info('Push notification sent', { messageId: response, title: payload.title });
      return true;
    } catch (error: any) {
      // Handle invalid token
      if (error.code === 'messaging/registration-token-not-registered') {
        log.warn('FCM token is no longer valid, should be removed', { fcmToken: fcmToken.substring(0, 20) + '...' });
      } else {
        log.error('Failed to send push notification', error, { title: payload.title });
      }
      return false;
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendMulticastNotification(
    fcmTokens: string[],
    payload: INotificationPayload
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!isFirebaseInitialized()) {
      log.debug('Firebase not initialized, skipping multicast notification');
      return { successCount: 0, failureCount: fcmTokens.length };
    }

    const admin = getFirebaseAdmin();
    if (!admin) {
      log.warn('Firebase admin not available');
      return { successCount: 0, failureCount: fcmTokens.length };
    }

    // Filter out empty tokens
    const validTokens = fcmTokens.filter((token) => token && token.trim());
    if (validTokens.length === 0) {
      log.debug('No valid FCM tokens provided');
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const message = {
        tokens: validTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'campus-fixit-updates',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      log.info('Multicast notification sent', {
        title: payload.title,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      log.error('Failed to send multicast notification', error, { 
        title: payload.title, 
        tokenCount: validTokens.length 
      });
      return { successCount: 0, failureCount: validTokens.length };
    }
  }

  /**
   * Send notification to all admins
   */
  async notifyAdmins(
    adminTokens: string[],
    payload: INotificationPayload
  ): Promise<void> {
    try {
      await this.sendMulticastNotification(adminTokens, payload);
    } catch (error) {
      log.error('Failed to notify admins', error, { title: payload.title });
    }
  }

  /**
   * Send notification for new issue reported
   */
  async sendNewIssueNotification(
    adminTokens: string[],
    issueTitle: string,
    category: string,
    priority: string,
    issueId: string
  ): Promise<void> {
    try {
      const payload: INotificationPayload = {
        title: 'New Issue Reported',
        body: `${issueTitle} (${category} - ${priority})`,
        data: {
          type: 'new_issue',
          issueId,
          category,
          priority,
        },
      };

      await this.sendMulticastNotification(adminTokens, payload);
      
      log.debug('New issue notification sent to admins', { issueId, adminCount: adminTokens.length });
    } catch (error) {
      log.error('Failed to send new issue notification', error, { issueId });
    }
  }

  /**
   * Send notification for issue status update
   */
  async sendStatusUpdateNotification(
    userToken: string,
    issueTitle: string,
    newStatus: string,
    issueId: string
  ): Promise<void> {
    try {
      const payload: INotificationPayload = {
        title: 'Issue Status Updated',
        body: `"${issueTitle}" is now ${newStatus.replace('_', ' ')}`,
        data: {
          type: 'status_update',
          issueId,
          status: newStatus,
        },
      };

      await this.sendPushNotification(userToken, payload);
      
      log.debug('Status update notification sent', { issueId, newStatus });
    } catch (error) {
      log.error('Failed to send status update notification', error, { issueId, newStatus });
    }
  }

  /**
   * Send notification for issue assigned
   */
  async sendIssueAssignedNotification(
    adminToken: string,
    issueTitle: string,
    issueId: string
  ): Promise<void> {
    try {
      const payload: INotificationPayload = {
        title: 'Issue Assigned to You',
        body: `You have been assigned: "${issueTitle}"`,
        data: {
          type: 'issue_assigned',
          issueId,
        },
      };

      await this.sendPushNotification(adminToken, payload);
      
      log.debug('Issue assigned notification sent', { issueId });
    } catch (error) {
      log.error('Failed to send issue assigned notification', error, { issueId });
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
